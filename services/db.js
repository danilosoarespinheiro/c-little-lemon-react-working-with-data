import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("little_lemon");

export async function createTable() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists menu_items (id integer primary key not null, uuid text, title text, price text, category text);"
        );
      },
      reject,
      resolve
    );
  });
}

export async function getMenuItems() {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql("select * from menu_items", [], (_, { rows }) => {
        resolve(rows._array);
      });
    });
  });
}

export function storeMenuItems(menuItems) {
  db.transaction((tx) => {
    menuItems.forEach((ele) => {
      tx.executeSql(
        "INSERT INTO menu_items (id, uuid, title, price, category) VALUES (?, ?, ?, ?, ?)",
        [ele?.id, ele?.id, ele?.title, ele?.price, ele?.category?.title],
        [],
        (_, { rows }) => {
          console.log("Successfully stored the menu items in the db.");
        },
        (error) => {
          console.error("storeMenuItems unexpected error:\n", error);
        }
      );
    });
  });
}

export async function deleteAllMenuItems() {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql("delete from menu_items", [], (_, result) => {
        console.log("Deleted");
        resolve(result);
      });
    });
  });
}

export async function filterByQueryAndCategories(query, activeCategories) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const result = [];
      let qStr = "?";
      activeCategories.forEach((ele) => {
        qStr += ", ?";
      });
      tx.executeSql(
        "select * from menu_items where category IN (" + qStr + ")",
        [...activeCategories],
        (_, { rows }) => {
          rows._array.forEach((ele) => {
            if (ele.title.toLowerCase().includes(query.toLowerCase())) {
              result.push(ele);
            }
          });
          resolve(result);
        }
      );
    });
  });
}
