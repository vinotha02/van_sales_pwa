console.log('=== MOCK SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('Directory:', __dirname);
const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Read all JSON files from the data directory
const dataDir = path.join(__dirname, 'data');
let combinedData = {};

if (fs.existsSync(dataDir)) {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // Merge each top-level key from the file into the combined object
      Object.assign(combinedData, fileData);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  }
}

combinedData.PickLists = combinedData.PickLists || [];
combinedData.DeliveryNotes = combinedData.DeliveryNotes || [];
combinedData.Attachments2 = combinedData.Attachments2 || [];
combinedData.PurchaseRequests = combinedData.PurchaseRequests || [];
combinedData.VehicleAuditLog = combinedData.VehicleAuditLog || [];
combinedData.WorkflowTasks = combinedData.WorkflowTasks || [];
combinedData.Invoices = combinedData.Invoices || [];
combinedData.VanInventory = combinedData.VanInventory || [];
combinedData.Settlements = combinedData.Settlements || [];

// json-server needs a file or an object to create a router.
// Writing to a temporary file allows normal db.json behavior (like persisting POST requests).
const tempDbPath = path.join(__dirname, 'combined-db.json');

if (fs.existsSync(tempDbPath)) {
  try {
    const existingDb = JSON.parse(fs.readFileSync(tempDbPath, 'utf-8'));
    // Merge existing DB over the static combinedData to preserve dynamic records
    combinedData = { ...combinedData, ...existingDb };
  } catch (e) {
    console.error('Error reading existing combined-db.json, recreating it.');
  }
}

//fs.writeFileSync(tempDbPath, JSON.stringify(combinedData, null, 2));

console.log("DATA DIR:", dataDir);
console.log("EXISTS:", fs.existsSync(dataDir));
console.log("VanInventory count:", combinedData.VanInventory?.length);

try {
  fs.writeFileSync(tempDbPath, JSON.stringify(combinedData, null, 2));
  console.log("combined-db created");
} catch (err) {
  console.error("WRITE ERROR:", err);
}

const router = jsonServer.router(tempDbPath);

server.use(middlewares);

// Parse JSON bodies. Inventory vision requests can include base64 camera images.
server.use(bodyParser.json({ limit: '25mb' }));
server.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));

// Add custom delay to simulate real network conditions
server.use((req, res, next) => {
  setTimeout(next, 500);
});

const getState = () => router.db.getState();
const writeState = () => router.db.write();
const collection = (name) => {
  const state = getState();
  if (!Array.isArray(state[name])) {
    state[name] = [];
    router.db.setState(state);
    writeState();
  }
  return state[name];
};
const nextNumber = (name, field, seed = 1) => {
  const values = collection(name)
    .map(item => Number(item[field]))
    .filter(Number.isFinite);
  return values.length ? Math.max(...values) + 1 : seed;
};
const sapDate = () => new Date().toISOString().slice(0, 10);
const audit = (action, payload) => {
  collection('VehicleAuditLog').push({
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    payload,
    userId: payload.userId || 'local-planner',
    timestamp: new Date().toISOString()
  });
};
const findPlan = (planId) => collection('plans').find(plan => String(plan.id) === String(planId));
const usersByRole = (role) => collection('users').filter(user => user.role === role);
const firstUserByRole = (role) => usersByRole(role)[0] || {};
const createWorkflowTask = (task) => {
  const tasks = collection('WorkflowTasks');
  const existing = tasks.find(item =>
    item.referenceType === task.referenceType &&
    String(item.referenceId) === String(task.referenceId) &&
    item.stage === task.stage
  );
  if (existing) return existing;

  const created = {
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: 'open',
    createdAt: new Date().toISOString(),
    ...task
  };
  tasks.push(created);
  return created;
};
const closeWorkflowTask = (referenceType, referenceId, stage, completedBy) => {
  const task = collection('WorkflowTasks').find(item =>
    item.referenceType === referenceType &&
    String(item.referenceId) === String(referenceId) &&
    item.stage === stage &&
    item.status !== 'completed'
  );
  if (!task) return null;
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.completedBy = completedBy;
  return task;
};
const routeStops = (plan) => (plan.routes || []).flatMap(route =>
  (route.orders || route.stops || []).map((stop, index) => ({ route, stop, index }))
);
const stopLines = (stop) => {
  if (Array.isArray(stop.document_lines)) return stop.document_lines;
  if (Array.isArray(stop.DocumentLines)) return stop.DocumentLines;
  if (Array.isArray(stop.items)) return stop.items;
  return [];
};
const stopDocNum = (stop) => stop.doc_num || stop.DocNum || stop.order_id || stop.order?.DocNum || stop.order?.id;
const stopDocEntry = (stop) => stop.doc_entry || stop.DocEntry || stop.order?.DocEntry || stopDocNum(stop);
const createPickListForStop = (plan, route, stop, index) => {
  const absoluteEntry = nextNumber('PickLists', 'AbsoluteEntry', 900001);
  const pickListNo = `PL-${new Date().getFullYear()}-${String(absoluteEntry).slice(-5)}`;
  const lines = stopLines(stop).map((line, lineIndex) => ({
    LineNumber: line.LineNum ?? lineIndex,
    BaseObjectType: 17,
    BaseEntry: stopDocEntry(stop),
    BaseLine: line.LineNum ?? lineIndex,
    OrderDocNum: stopDocNum(stop),
    ItemCode: line.ItemCode,
    ItemDescription: line.ItemName || line.ItemDescription,
    WarehouseCode: stop.warehouse_code || line.WarehouseCode || plan.depot?.code || plan.depot?.id || plan.depot,
    ReleasedQuantity: Number(line.Quantity ?? line.quantity ?? 0),
    WeightKg: Number(line.WeightKg ?? line.weightKg ?? 0),
    PickedQuantity: 0,
    BatchNumbers: line.BatchNumbers || [],
    SerialNumbers: line.SerialNumbers || [],
    BinAllocations: line.BinAllocations || []
  }));

  return {
    AbsoluteEntry: absoluteEntry,
    PickListNo: pickListNo,
    Name: `${plan.name || plan.id} - ${stop.name || stop.customer_id || stopDocNum(stop)}`,
    Object: 'PickLists',
    PickDate: sapDate(),
    Status: 'Released',
    U_PlanId: plan.id,
    U_RouteId: route.id || route.routeNumber || route.truck_id,
    U_TruckId: route.truck_id || route.truck?.id,
    U_DriverId: route.driver_id || route.driver?.id || null,
    U_CustomerName: stop.name || stop.customer_id || stop.order?.customer?.CardName,
    U_City: stop.city || stop.address?.city || stop.order?.deliveryAddress?.city,
    U_TotalWeightKg: lines.reduce((sum, l) => sum + (l.WeightKg || 0), 0),
    Remarks: 'Created by local delivery planning approval',
    PickListsLines: lines,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };
};
const createPurchaseRequestForPlan = (plan) => {
  const overloadedRoutes = (plan.routes || []).filter(route =>
    route.overloaded || Number(route.capacity_utilization_percent || route.capacityUsedPercent || 0) > 100
  );
  if (!overloadedRoutes.length) return null;

  const docEntry = nextNumber('PurchaseRequests', 'DocEntry', 700001);
  const prLines = overloadedRoutes.map((route, index) => ({
    LineNum: index,
    ItemCode: 'OUTSOURCE-VEHICLE',
    ItemDescription: `Third-party vehicle for route ${route.id || route.routeNumber || route.truck_id}`,
    Quantity: 1,
    RequiredCapacityKg: Math.max(0, Number(route.total_weight_kg || 0) - (Number(route.capacity_kg || 0))),
    WarehouseCode: route.depot_id || plan.depot?.code || plan.depot?.id,
    UnitPrice: 1200,
    TaxCode: 'VAT5',
    U_RouteId: route.id || route.routeNumber || route.truck_id
  }));

  return {
    DocEntry: docEntry,
    DocNum: `PR-${new Date().getFullYear()}-${String(docEntry).slice(-5)}`,
    Object: 'PurchaseRequests',
    DocDate: sapDate(),
    DocDueDate: sapDate(),
    DocumentStatus: 'bost_Open',
    ApprovalStatus: 'PendingManagerApproval',
    RequriedDate: sapDate(),
    U_PlanId: plan.id,
    U_RecommendationType: 'VehicleOutsourcing',
    Comments: 'Created because owned fleet capacity was exceeded in the approved plan.',
    U_TotalWeightKg: prLines.reduce((sum, l) => sum + (l.RequiredCapacityKg || 0), 0),
    DocumentLines: prLines,
    CreatedAt: new Date().toISOString()
  };
};

server.post('/api/plans/:id/approve', (req, res) => {
  const plan = findPlan(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }

  const existingPickLists = collection('PickLists').filter(item => item.U_PlanId === plan.id);
  const createdPickLists = existingPickLists.length
    ? existingPickLists
    : routeStops(plan).map(({ route, stop, index }) => createPickListForStop(plan, route, stop, index));

  if (!existingPickLists.length) {
    collection('PickLists').push(...createdPickLists);
  }

  const existingPr = collection('PurchaseRequests').find(item => item.U_PlanId === plan.id);
  const purchaseRequest = existingPr || createPurchaseRequestForPlan(plan);
  if (purchaseRequest && !existingPr) {
    collection('PurchaseRequests').push(purchaseRequest);
  }
  if (purchaseRequest) {
    purchaseRequest.ApprovalStatus = 'Approved';
    purchaseRequest.ApprovedAt = new Date().toISOString();
    purchaseRequest.ApprovedBy = req.body?.approvedBy || firstUserByRole('manager');
  }

  const planner = plan.createdBy || firstUserByRole('planner');
  const manager = req.body?.approvedBy || firstUserByRole('manager');
  const warehouse = firstUserByRole('warehouse');

  Object.assign(plan, {
    status: 'approved',
    statusLabel: 'Approved - Picklists Released',
    approvedAt: new Date().toISOString(),
    approvedBy: manager,
    pickListNumbers: createdPickLists.map(item => item.PickListNo),
    purchaseRequestNumber: purchaseRequest?.DocNum || null,
    workflow: [
      {
        stage: 'planner_review',
        title: 'Planner reviewed suggested plan',
        role: 'planner',
        status: 'completed',
        user: planner,
        completedAt: plan.createdAt || new Date().toISOString()
      },
      {
        stage: 'manager_approval',
        title: purchaseRequest ? 'Manager approved plan and outsourcing cost' : 'Manager approved delivery plan',
        role: 'manager',
        status: 'completed',
        user: manager,
        completedAt: new Date().toISOString()
      },
      {
        stage: 'warehouse_picking',
        title: 'Warehouse confirms picking',
        role: 'warehouse',
        status: 'open',
        user: warehouse
      },
      {
        stage: 'driver_execution',
        title: 'Driver confirms pickup, delivery, and POD',
        role: 'driver',
        status: 'waiting'
      }
    ],
    canApprove: false,
    canEdit: false
  });

  createdPickLists.forEach(pickList => {
    createWorkflowTask({
      referenceType: 'PickLists',
      referenceId: pickList.AbsoluteEntry,
      stage: 'warehouse_picking',
      title: `Confirm picking for ${pickList.PickListNo}`,
      assignedRole: 'warehouse',
      assignedTo: warehouse.id,
      assignedToName: warehouse.name,
      planId: plan.id
    });
  });

  audit('PLAN_APPROVED', {
    planId: plan.id,
    pickListNumbers: plan.pickListNumbers,
    purchaseRequestNumber: plan.purchaseRequestNumber
  });
  writeState();

  res.json({ success: true, data: { plan, pickLists: createdPickLists, purchaseRequest } });
});

server.post('/api/PickLists/:id/complete', (req, res) => {
  const pickList = collection('PickLists').find(item => String(item.AbsoluteEntry) === String(req.params.id));
  if (!pickList) {
    return res.status(404).json({ success: false, error: 'Picklist not found' });
  }

  pickList.PickListsLines = (pickList.PickListsLines || []).map(line => ({
    ...line,
    PickedQuantity: Number(line.ReleasedQuantity || 0)
  }));
  pickList.Status = 'Picked';
  pickList.PickedAt = new Date().toISOString();
  pickList.PickedBy = req.body?.pickedBy || firstUserByRole('warehouse').id || 'warehouse-user';
  pickList.PickedByName = req.body?.pickedByName || firstUserByRole('warehouse').name || 'Warehouse User';
  pickList.UpdatedAt = new Date().toISOString();

  closeWorkflowTask('PickLists', pickList.AbsoluteEntry, 'warehouse_picking', {
    id: pickList.PickedBy,
    name: pickList.PickedByName
  });
  createWorkflowTask({
    referenceType: 'PickLists',
    referenceId: pickList.AbsoluteEntry,
    stage: 'driver_assignment',
    title: `Create delivery and assign driver for ${pickList.PickListNo}`,
    assignedRole: 'warehouse',
    assignedTo: firstUserByRole('warehouse').id,
    assignedToName: firstUserByRole('warehouse').name,
    planId: pickList.U_PlanId
  });

  audit('PICKLIST_PICKED', { pickListId: pickList.AbsoluteEntry, pickListNo: pickList.PickListNo });
  writeState();

  res.json({ success: true, data: pickList });
});

server.post('/api/DeliveryNotes/from-picklist', (req, res) => {
  const pickList = collection('PickLists').find(item => String(item.AbsoluteEntry) === String(req.body?.pickListId));
  if (!pickList) {
    return res.status(404).json({ success: false, error: 'Picklist not found' });
  }

  const incompleteLine = (pickList.PickListsLines || []).find(line =>
    Number(line.PickedQuantity || 0) < Number(line.ReleasedQuantity || 0)
  );
  if (pickList.Status !== 'Picked' || incompleteLine) {
    return res.status(409).json({
      success: false,
      error: 'Delivery creation is blocked until picking is complete and confirmed.'
    });
  }

  const existingDelivery = collection('DeliveryNotes').find(item => item.U_PickListEntry === pickList.AbsoluteEntry);
  if (existingDelivery) {
    return res.json({ success: true, data: existingDelivery });
  }

  const docEntry = nextNumber('DeliveryNotes', 'DocEntry', 800001);
  const delivery = {
    DocEntry: docEntry,
    DocNum: `DN-${new Date().getFullYear()}-${String(docEntry).slice(-5)}`,
    Object: 'DeliveryNotes',
    DocDate: sapDate(),
    TaxDate: sapDate(),
    DocDueDate: sapDate(),
    CardName: pickList.U_CustomerName,
    DocumentStatus: 'bost_Open',
    DeliveryStatus: 'DriverAssigned',
    WorkflowStatus: 'AwaitingDriverPickup',
    U_PlanId: pickList.U_PlanId,
    U_RouteId: pickList.U_RouteId,
    U_PickListEntry: pickList.AbsoluteEntry,
    U_PickListNo: pickList.PickListNo,
    U_TruckId: pickList.U_TruckId,
    U_DriverId: req.body?.driverId || pickList.U_DriverId || 'drv-001',
    U_DriverName: req.body?.driverName || 'Mohammed Khan',
    Comments: 'Created from completed local picklist confirmation',
    DocumentLines: (pickList.PickListsLines || []).map((line, index) => ({
      LineNum: index,
      BaseType: 17,
      BaseEntry: line.BaseEntry,
      BaseLine: line.BaseLine,
      ItemCode: line.ItemCode,
      ItemDescription: line.ItemDescription,
      Quantity: Number(line.PickedQuantity || 0),
      WarehouseCode: line.WarehouseCode,
      TaxCode: line.TaxCode || 'VAT5'
    })),
    Attachments2_Lines: [],
    CreatedAt: new Date().toISOString()
  };

  pickList.Status = 'DeliveryCreated';
  pickList.DeliveryDocEntry = delivery.DocEntry;
  pickList.DeliveryDocNum = delivery.DocNum;
  pickList.UpdatedAt = new Date().toISOString();
  collection('DeliveryNotes').push(delivery);
  closeWorkflowTask('PickLists', pickList.AbsoluteEntry, 'driver_assignment', {
    id: 'usr-warehouse-001',
    name: 'Warehouse Supervisor'
  });
  createWorkflowTask({
    referenceType: 'DeliveryNotes',
    referenceId: delivery.DocEntry,
    stage: 'driver_pickup',
    title: `Driver pickup confirmation for ${delivery.DocNum}`,
    assignedRole: 'driver',
    assignedTo: delivery.U_DriverId,
    assignedToName: delivery.U_DriverName,
    planId: delivery.U_PlanId
  });

  audit('DELIVERY_CREATED', {
    pickListId: pickList.AbsoluteEntry,
    deliveryDocEntry: delivery.DocEntry,
    driverId: delivery.U_DriverId
  });
  writeState();

  res.json({ success: true, data: delivery });
});

server.post('/api/DeliveryNotes/:id/pickup', (req, res) => {
  const delivery = collection('DeliveryNotes').find(item =>
    String(item.DocEntry) === String(req.params.id) || String(item.DocNum) === String(req.params.id)
  );
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' });
  }
  if (delivery.DeliveryStatus === 'Delivered') {
    return res.status(409).json({ success: false, error: 'Delivery is already completed.' });
  }

  delivery.DeliveryStatus = 'PickedUp';
  delivery.WorkflowStatus = 'InTransit';
  delivery.PickedUpAt = new Date().toISOString();
  delivery.PickupConfirmedBy = req.body?.driverId || delivery.U_DriverId;
  delivery.PickupConfirmedByName = req.body?.driverName || delivery.U_DriverName;

  closeWorkflowTask('DeliveryNotes', delivery.DocEntry, 'driver_pickup', {
    id: delivery.PickupConfirmedBy,
    name: delivery.PickupConfirmedByName
  });
  createWorkflowTask({
    referenceType: 'DeliveryNotes',
    referenceId: delivery.DocEntry,
    stage: 'pod_collection',
    title: `Collect POD for ${delivery.DocNum}`,
    assignedRole: 'driver',
    assignedTo: delivery.U_DriverId,
    assignedToName: delivery.U_DriverName,
    planId: delivery.U_PlanId
  });

  audit('DRIVER_PICKUP_CONFIRMED', {
    deliveryDocEntry: delivery.DocEntry,
    driverId: delivery.PickupConfirmedBy
  });
  writeState();

  res.json({ success: true, data: delivery });
});

server.post('/api/DeliveryNotes/:id/pod', (req, res) => {
  const delivery = collection('DeliveryNotes').find(item =>
    String(item.DocEntry) === String(req.params.id) || String(item.DocNum) === String(req.params.id)
  );
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' });
  }
  if (delivery.DeliveryStatus !== 'PickedUp' && delivery.DeliveryStatus !== 'InTransit') {
    return res.status(409).json({
      success: false,
      error: 'POD is blocked until the driver confirms pickup.'
    });
  }

  const absoluteEntry = nextNumber('Attachments2', 'AbsoluteEntry', 600001);
  const attachment = {
    AbsoluteEntry: absoluteEntry,
    Object: 'Attachments2',
    U_DeliveryDocEntry: delivery.DocEntry,
    U_DeliveryDocNum: delivery.DocNum,
    U_PlanId: delivery.U_PlanId,
    Attachments2_Lines: [
      {
        LineNum: 0,
        SourcePath: 'local-pod',
        FileName: `POD-${delivery.DocNum}`,
        FileExtension: 'json',
        AttachmentDate: sapDate(),
        Override: 'tYES',
        U_PhotoHash: req.body?.photoHash,
        U_SignatureHash: req.body?.signatureHash,
        U_VerificationHash: req.body?.verificationHash
      }
    ],
    Metadata: {
      gps: req.body?.gps,
      timestamp: req.body?.timestamp || new Date().toISOString(),
      notes: req.body?.notes || '',
      status: req.body?.status || 'Delivered'
    },
    CreatedAt: new Date().toISOString()
  };

  collection('Attachments2').push(attachment);
  delivery.AttachmentEntry = attachment.AbsoluteEntry;
  delivery.Attachments2_Lines = attachment.Attachments2_Lines;
  delivery.DeliveryStatus = req.body?.status || 'Delivered';
  delivery.WorkflowStatus = 'Completed';
  delivery.DocumentStatus = 'bost_Close';
  delivery.DeliveredAt = new Date().toISOString();
  delivery.U_PODHash = req.body?.verificationHash;
  closeWorkflowTask('DeliveryNotes', delivery.DocEntry, 'pod_collection', {
    id: delivery.U_DriverId,
    name: delivery.U_DriverName
  });

  audit('POD_ATTACHED', {
    deliveryDocEntry: delivery.DocEntry,
    attachmentEntry: attachment.AbsoluteEntry
  });
  writeState();

  res.json({ success: true, data: { delivery, attachment } });
});

server.post('/api/Invoices', (req, res) => {
  const invoices = collection('Invoices');
  const docEntry = nextNumber('Invoices', 'DocEntry', 300001);
  const docNum = `INV-${new Date().getFullYear()}-${String(docEntry).slice(-5)}`;
  
  const lines = Array.isArray(req.body.DocumentLines) ? req.body.DocumentLines : [];
  let subtotal = 0;
  const documentLines = lines.map((line, index) => {
    const qty = Number(line.Quantity || 0);
    const price = Number(line.UnitPrice || 0);
    const lineTotal = Number((qty * price).toFixed(2));
    subtotal += lineTotal;
    return {
      LineNum: index,
      ItemCode: line.ItemCode,
      ItemDescription: line.ItemDescription || line.ItemName || '',
      Quantity: qty,
      UnitPrice: price,
      TaxCode: line.TaxCode || 'VAT5',
      LineTotal: lineTotal,
      WarehouseCode: line.WarehouseCode || 'WH-VAN-01'
    };
  });
  
  const vatSum = Number((subtotal * 0.05).toFixed(2));
  const docTotal = Number((subtotal + vatSum).toFixed(2));
  
  const newInvoice = {
    DocEntry: docEntry,
    DocNum: docNum,
    CardCode: req.body.CardCode || 'C-MOCK',
    CardName: req.body.CardName || 'Cash Customer',
    DocDate: req.body.DocDate || sapDate(),
    DocDueDate: req.body.DocDueDate || sapDate(),
    TaxDate: req.body.TaxDate || sapDate(),
    DocTotal: docTotal,
    VatSum: vatSum,
    DocCurrency: req.body.DocCurrency || 'AED',
    Comments: req.body.Comments || 'Created from Van Sales Cockpit',
    PaymentMethod: req.body.PaymentMethod || 'Cash',
    U_ChequeNo: req.body.U_ChequeNo || null,
    U_ChequeBank: req.body.U_ChequeBank || null,
    U_ChequeImage: req.body.U_ChequeImage || null,
    DocumentLines: documentLines,
    Object: 'Invoices',
    CreatedAt: new Date().toISOString()
  };
  
  invoices.push(newInvoice);
  
  audit('AR_INVOICE_CREATED', {
    DocEntry: newInvoice.DocEntry,
    DocNum: newInvoice.DocNum,
    CardName: newInvoice.CardName,
    DocTotal: newInvoice.DocTotal
  });
  
  writeState();
  
  res.json({ success: true, data: newInvoice });
});

server.post('/api/settlements', (req, res) => {
  const settlements = collection('Settlements');
  const id = nextNumber('Settlements', 'id', 10001);
  const docNum = `SET-${new Date().getFullYear()}-${String(id).slice(-5)}`;
  
  const newSettlement = {
    id: id,
    DocNum: docNum,
    shiftDate: req.body.shiftDate || sapDate(),
    driverId: req.body.driverId || 'DRV-001',
    driverName: req.body.driverName || 'Sami Al-Dhaheri',
    vehiclePlate: req.body.vehiclePlate || 'DXB-9812A',
    startOdometer: Number(req.body.startOdometer || 0),
    endOdometer: Number(req.body.endOdometer || 0),
    totalKm: Number(req.body.totalKm || 0),
    openingCashFloat: Number(req.body.openingCashFloat || 0),
    expectedCash: Number(req.body.expectedCash || 0),
    physicalCash: Number(req.body.physicalCash || 0),
    variance: Number(req.body.variance || 0),
    collections: req.body.collections || { cash: 0, cheque: 0, card: 0, account: 0 },
    cheques: req.body.cheques || [],
    zReportPrinted: req.body.zReportPrinted || false,
    status: req.body.status || 'Closed',
    createdAt: new Date().toISOString()
  };

  settlements.push(newSettlement);
  
  audit('FINANCIAL_SETTLEMENT_SUBMITTED', {
    id: newSettlement.id,
    DocNum: newSettlement.DocNum,
    driverName: newSettlement.driverName,
    variance: newSettlement.variance
  });

  writeState();
  
  res.json({ success: true, data: newSettlement });
});

// Custom formatting to match the "success: true, data: { ... }" structure from documentation
router.render = (req, res) => {
  res.jsonp({
    success: res.statusCode >= 200 && res.statusCode < 300,
    data: res.locals.data
  });
};

// JavaScript fallback optimizer in case python or its dependencies are not installed
const generateJsOptimizationFallback = (orders, trucks, depots, itemWarehouseCollection) => {
  const routes = [];
  const sortedOrders = [...orders].sort((a, b) => (b.WeightKg || 0) - (a.WeightKg || 0));
  
  const assignments = trucks.map(truck => {
    const depotCode = truck.WarehouseCode || truck.depot_id;
    const depot = depots.find(d => d.WarehouseCode === depotCode || d.code === depotCode) || depots[0];
    return {
      truck,
      depot,
      orders: [],
      weight: 0,
      capacity: (truck.CapacityTons || 10) * 1000
    };
  });

  const getOrderCity = (order) => {
    return order.AddressExtension?.ShipToCity || order.City || order.AddressExtension?.BillToCity || 'Dubai';
  };

  const getOrderStreet = (order) => {
    const addr = order.AddressExtension || {};
    const parts = [addr.ShipToStreet, addr.ShipToStreetNo, addr.ShipToBlock, addr.ShipToBuilding, order.Street].filter(Boolean);
    return parts.join(', ') || '-';
  };

  sortedOrders.forEach(order => {
    const weight = order.WeightKg || 0;
    let assigned = assignments.find(a => a.weight + weight <= a.capacity);
    if (!assigned && assignments.length > 0) {
      assigned = assignments[0];
    }
    if (assigned) {
      assigned.orders.push(order);
      assigned.weight += weight;
    }
  });

  assignments.forEach((assignment, idx) => {
    if (assignment.orders.length === 0) return;
    const { truck, depot, orders: truckOrders, weight: totalWeight } = assignment;
    const capacityPercent = Math.round((totalWeight / assignment.capacity) * 100 * 100) / 100;
    
    let totalDistance = 0;
    const stops = truckOrders.map((order, seq) => {
      const distance = 15 + seq * 8;
      totalDistance += distance;
      const lines = order.DocumentLines || order.items || [];
      return {
        sequence: seq + 1,
        customer_id: order.CardName || 'Retail Customer',
        name: order.CardName || 'Retail Customer',
        card_code: order.CardCode,
        doc_entry: order.DocEntry,
        doc_num: order.DocNum,
        doc_due_date: order.DocDueDate,
        ship_date: order.ShipDate,
        weight_kg: order.WeightKg || 0,
        volume_m3: order.VolumeM3 || 0,
        order_id: order.DocNum || order.id,
        warehouse_code: order.WarehouseCode,
        status: order.DocumentStatus || order.Status || 'Open',
        street: getOrderStreet(order),
        address: {
          city: getOrderCity(order),
          street: getOrderStreet(order),
          address_extension: order.AddressExtension || {}
        },
        tax: {
          VatSum: order.VatSum,
          TaxTotal: order.TaxTotal,
          DocTotal: order.DocTotal,
          DocCurrency: order.DocCurrency
        },
        line_count: lines.length,
        document_lines: lines,
        lat: order.Latitude || 25.2048,
        lng: order.Longitude || 55.2708,
        city: getOrderCity(order),
        leg_distance_km: distance,
        leg_duration_min: Math.round(distance * 1.5)
      };
    });

    routes.push({
      truck_id: truck.TruckId || truck.id,
      driver_id: truck.DriverId || null,
      depot_id: truck.WarehouseCode || truck.depot_id,
      total_distance_km: Math.round((totalDistance + 12) * 100) / 100,
      total_weight_kg: totalWeight,
      capacity_utilization_percent: capacityPercent,
      overloaded: capacityPercent > 100,
      estimated_duration_min: Math.round((totalDistance + 12) * 1.5),
      fuel_cost_aed: Math.round((totalDistance + 12) * 0.8 * 100) / 100,
      distance_source: 'js-optimizer-fallback',
      return_leg_distance_km: 12,
      return_leg_duration_min: 18,
      orders: stops
    });
  });

  const totalDist = routes.reduce((sum, r) => sum + r.total_distance_km, 0);
  const totalFuel = routes.reduce((sum, r) => sum + r.fuel_cost_aed, 0);
  
  return {
    name: `AI Optimized Plan - ${new Date().toISOString().slice(0, 10)}`,
    week_start: new Date().toISOString().slice(0, 10),
    week_end: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    status: 'draft',
    total_distance_km: Math.round(totalDist * 100) / 100,
    total_fuel_cost: Math.round(totalFuel * 100) / 100,
    truck_count: routes.length,
    order_count: routes.reduce((sum, r) => sum + r.orders.length, 0),
    total_weight_kg: routes.reduce((sum, r) => sum + r.total_weight_kg, 0),
    routes,
    stock_check: {
      allAvailable: true,
      items: []
    },
    capacity_warnings: [],
    route_warnings: [],
    distance_source: 'js-optimizer-fallback',
    solver: 'js-greedy-fallback',
    purchaseRequests: routes.filter(r => r.overloaded).map(r => ({
      id: `PR-DRAFT-JS-${Date.now()}-${r.truck_id}`,
      type: "3PL Outsourced Trucking (Peak Demand)",
      cost: Math.round((r.capacity_utilization_percent - 100) * 15),
      status: "Draft"
    })),
    pickLists: routes.map(r => ({
      id: `PL-PREVIEW-${r.truck_id}`,
      truck: r.truck_id,
      orderCount: r.orders.length,
      status: "Preview"
    }))
  };
};

// Custom endpoint to run the AI Optimizer (Python script)
server.post('/api/optimize', (req, res) => {
  const { exec } = require('child_process');
  const tempInputPath = path.join(__dirname, `temp_input_${Date.now()}_${Math.random().toString(16).slice(2)}.json`);
  
  const inputData = {
    orders: req.body.orders || [],
    trucks: req.body.trucks || [],
    depots: combinedData.warehouses || [],
    item_warehouse_collection: combinedData.ItemWarehouseCollection || []
  };

  fs.writeFileSync(tempInputPath, JSON.stringify(inputData));

  const scriptPath = path.join(__dirname, '..', 'backend', 'services', 'logistics', 'optimizer.py');
  
  exec(`python "${scriptPath}" < "${tempInputPath}"`, (error, stdout, stderr) => {
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);

    if (error) {
      console.warn(`exec error (falling back to JS optimizer): ${error}`);
      const fallbackResult = generateJsOptimizationFallback(
        inputData.orders,
        inputData.trucks,
        inputData.depots,
        inputData.item_warehouse_collection
      );
      return res.json({
        success: true,
        data: fallbackResult
      });
    }
    
    try {
      const resultJson = JSON.parse(stdout);
      res.json({
        success: true,
        data: resultJson
      });
    } catch (e) {
      console.error('Parsing error:', e, stdout);
      const fallbackResult = generateJsOptimizationFallback(
        inputData.orders,
        inputData.trucks,
        inputData.depots,
        inputData.item_warehouse_collection
      );
      res.json({
        success: true,
        data: fallbackResult
      });
    }
  });
});

// OCR / Pipe Counting / Gamification API Endpoints
server.post('/api/inventory/count', (req, res) => {
  const { userId, locationId, expectedCount, itemCode, image, profileType, itemType } = req.body;
  
  // 1. Spawns our custom Python Hough Circle Transform script
  const tempInputPath = path.join(__dirname, `temp-count-input-${Date.now()}.json`);
  const isDataImage = typeof image === 'string' && image.startsWith('data:image');
  const inputData = {
    image: isDataImage ? image : '',
    imagePath: isDataImage ? '' : (image || ''),
    expectedCount: expectedCount !== undefined && expectedCount !== null ? parseInt(expectedCount) : null,
    profileType: profileType || itemType || 'mixed',
    saveAnnotated: true
  };
  
  fs.writeFileSync(tempInputPath, JSON.stringify(inputData));
  const scriptPath = path.join(__dirname, '..', 'backend', 'services', 'logistics', 'pipe_detector.py');
  
  exec(`python "${scriptPath}" < "${tempInputPath}"`, (error, stdout, stderr) => {
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    
    let pyResult = { detectedCount: expectedCount || 20, confidence: 0.95, circles: [] };
    if (!error && stdout) {
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.success) {
          pyResult = parsed;
        }
      } catch (e) {
        console.error('Failed to parse pipe_detector output:', e, stdout);
      }
    } else {
      console.warn('pipe_detector script error:', error, stderr);
    }
    
    const detectedCount = pyResult.detectedCount;
    const confidence = pyResult.confidence;
    const circles = pyResult.circles;
    
    const target = expectedCount !== undefined && expectedCount !== null ? parseInt(expectedCount) : detectedCount;
    
    // 2. Calculate accuracy score
    let accuracy = 1.0;
    if (target > 0) {
      accuracy = 1.0 - Math.abs(detectedCount - target) / target;
      if (accuracy < 0) accuracy = 0;
    }
    
    // 3. Award gamification points
    const basePoints = detectedCount === target ? 125 : 50; // 125 XP for perfect match (+75 XP bonus), 50 XP otherwise
    const pointsEarned = Math.floor(basePoints * accuracy);
    
    // Update user stats in our mock database
    const users = collection('users');
    const user = users.find(u => u.id === userId) || users[0] || { id: 'usr-warehouse-001', name: 'Khalid Al Mansouri' };
    
    if (user) {
      user.total_xp = (user.total_xp || 0) + pointsEarned;
      user.totalCounts = (user.totalCounts || 0) + 1;
      if (detectedCount === target) {
        user.accurateCounts = (user.accurateCounts || 0) + 1;
        user.currentStreak = (user.currentStreak || 0) + 1;
      } else {
        user.currentStreak = 0;
      }
      
      // Check level-up (every 1000 XP)
      const oldLevel = user.level || 1;
      user.level = Math.floor((user.total_xp) / 1000) + 1;
      const isLevelUp = user.level > oldLevel;
      
      // Check achievements/badges
      user.badges = user.badges || ['BEGINNER'];
      let badgeUnlocked = null;
      if (user.currentStreak >= 5 && !user.badges.includes('HOT_STREAK')) {
        user.badges.push('HOT_STREAK');
        badgeUnlocked = 'HOT_STREAK';
      }
      if (user.totalCounts >= 10 && !user.badges.includes('EAGLE_EYE')) {
        user.badges.push('EAGLE_EYE');
        badgeUnlocked = 'EAGLE_EYE';
      }
      
      // Record into WMS audit log
      audit('STOCK_OCR_COUNT', {
        userId: user.id,
        itemCode,
        locationId,
        expectedCount: target,
        detectedCount,
        accuracy,
        pointsEarned,
        isLevelUp,
        badgeUnlocked
      });
      
      writeState();
      
      // Return gorgeous CV response
      return res.json({
        success: true,
        data: {
          detectedCount,
          confidence,
          accuracy,
          pointsEarned,
          isLevelUp,
          badgeUnlocked,
          circles,
          method: pyResult.method,
          profileCounts: pyResult.profileCounts || {},
          detections: pyResult.detections || [],
          annotatedImagePath: pyResult.annotatedImagePath || null,
          gamerStats: {
            level: user.level,
            xp: user.total_xp,
            totalCounts: user.totalCounts,
            accurateCounts: user.accurateCounts,
            currentStreak: user.currentStreak,
            badges: user.badges
          }
        }
      });
    }
    
    res.status(500).json({ success: false, error: 'User not found in system' });
  });
});

// Leaderboard endpoint
server.get('/api/leaderboard', (req, res) => {
  const users = collection('users');
  
  // Format users with gamified stats if missing
  const leaderboardData = users.map(user => {
    // Generate simulated high-end stats for competitive leaderboard if empty
    let xp = user.total_xp;
    if (xp === undefined) {
      if (user.role === 'warehouse') xp = 3450;
      else if (user.role === 'manager') xp = 1200;
      else if (user.role === 'driver') xp = 850;
      else xp = 1500;
    }
    
    return {
      id: user.id,
      name: user.name,
      designation: user.designation,
      role: user.role,
      xp: xp,
      level: Math.floor(xp / 1000) + 1,
      totalCounts: user.totalCounts || (xp > 1000 ? Math.floor(xp / 75) : 5),
      accuracy: user.accuracy_rate || 0.94
    };
  }).sort((a, b) => b.xp - a.xp);
  
  res.json({
    success: true,
    data: leaderboardData
  });
});

// Custom GET for PickLists by ID (AbsoluteEntry or PickListNo)
server.get('/api/PickLists/:id', (req, res, next) => {
  const pickList = collection('PickLists').find(item => 
    String(item.AbsoluteEntry) === String(req.params.id) || 
    String(item.PickListNo) === String(req.params.id)
  );
  if (pickList) {
    return res.json({ success: true, data: pickList });
  }
  next();
});

// Custom GET for DeliveryNotes by ID (DocEntry or DocNum)
server.get('/api/DeliveryNotes/:id', (req, res, next) => {
  const delivery = collection('DeliveryNotes').find(item => 
    String(item.DocEntry) === String(req.params.id) || 
    String(item.DocNum) === String(req.params.id)
  );
  if (delivery) {
    return res.json({ success: true, data: delivery });
  }
  next();
});

// Custom GET for Invoices by ID (DocEntry or DocNum)
server.get('/api/Invoices/:id', (req, res, next) => {
  const invoice = collection('Invoices').find(item => 
    String(item.DocEntry) === String(req.params.id) || 
    String(item.DocNum) === String(req.params.id)
  );
  if (invoice) {
    return res.json({ success: true, data: invoice });
  }
  next();
});

server.post('/api/expenses', (req, res) => {
  const expenses = collection('expenses');
  const newExpense = {
    id: Math.random().toString(36).slice(2, 9),
    ...req.body,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    status: req.body.status || 'Pending',
    createdAt: new Date().toISOString()
  };
  expenses.push(newExpense);
  writeState();
  res.json({ success: true, data: newExpense });
});

// Use the router under /api
server.use('/api', router);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
