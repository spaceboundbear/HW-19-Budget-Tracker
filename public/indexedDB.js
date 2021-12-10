let db;

const req = indexedDB.open('budget', 1);

req.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore('new-tx', { autoIncrement: true });
};

req.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) {
    uploadDb();
  }
};

req.onerror = (e) => {
  console.log(e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new-tx'], 'readwrite');
  const store = transaction.objectStore('new-tx');

  store.add(record);
}

function uploadDb() {
  const transaction = db.transaction(['new-tx'], 'readwrite');
  const store = transaction.objectStore('new-tx');
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
          const transaction = db.transaction(['new-tx'], 'readwrite');
          const store = transaction.objectStore('new-tx');

          store.clear();

          console.log('saved transactions submitted');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadDb);
