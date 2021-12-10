let db;

const req = window.indexedDB.open('budget_tracker', 1);

req.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore('new-tx', { keyPath: '_id' });
};

req.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) {
    uploadDb();
  } else {
    saveRecord();
  }
};

req.onerror = (e) => {
  console.log('error');
};

function saveRecord(rec) {
  const transaction = db.transaction(['new-tx'], 'readwrite');
  const store = transaction.objectStore('new-tx');

  store.add(rec);
}

function uploadDb() {
  const transaction = db.transaction(['new-tx'], 'readwrite');
  const store = transaction.objectStore('new-tx');
  const all = store.getAll();

  all.onsuccess = function () {
    if (all.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(all.result),
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
