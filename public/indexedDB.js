let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('storeBudget', { autoIncrement: true });
  }
};

request.onsuccess = (e) => {
  console.log('success');
  db = e.target.result;
  if (navigator.onLine) {
    uploadDb();
  }
};

request.onerror = (e) => {
  console.log(e.target.errorCode);
};

function uploadDb() {
  console.log('checking db');
  let transaction = db.transaction(['storeBudget'], 'readwrite');
  const store = transaction.objectStore('storeBudget');
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          transaction = db.transaction(['storeBudget'], 'readwrite');
          const storeC = transaction.objectStore('storeBudget');

          storeC.clear();

          console.log('saved transactions submitted');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

function saveRecord(record) {
  console.log('save record executed');
  const transaction = db.transaction(['storeBudget'], 'readwrite');
  const store = transaction.objectStore('storeBudget');

  store.add(record);
}

window.addEventListener('online', uploadDb);
