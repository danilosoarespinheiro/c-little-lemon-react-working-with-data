const API_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json";

export const fetchData = async () => {
  try {
    const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }),
      menuData = await res.json();

    return menuData.menu;
  } catch (error) {
    console.error("fetchData error:\n", error.message);
  }
  return [];
};
