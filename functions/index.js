const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.checkout = functions.https.onRequest(async (req, res) => {

  const cart = req.body.cart;

  let total = 0;
  let items = [];

  // 取得發票號碼
  const counterRef = db.collection("system").doc("counter");
  const counterSnap = await counterRef.get();

  let invoiceNo = 1;

  if(counterSnap.exists){
    invoiceNo = counterSnap.data().invoiceNo + 1;
  }

  await counterRef.set({ invoiceNo });

  // 扣庫存 + 計算
  for(let item of cart){
    total += item.price;
    items.push(item.name);
  }

  const no = "AB" + String(invoiceNo).padStart(8,"0");

  // 寫入發票
  await db.collection("invoices").add({
    invoiceNo: no,
    items,
    total,
    time: new Date()
  });

  res.json({
    ok:true,
    invoiceNo: no
  });
});
