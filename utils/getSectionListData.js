import { sections } from "../constants";

export function getSectionListData(menuItems) {
  let sectionData = [],
    foundSections = [];

  menuItems.forEach((ele) => {
    const category = ele.category.title || ele.category;

    if (sections.includes(category)) {
      const sectionIndex = foundSections.indexOf(category);
      // If the section exists, add to its data array.
      if (sectionIndex !== -1) {
        sectionData[sectionIndex].data.push({
          id: ele.id,
          title: ele.title,
          price: ele.price,
        });
      } else {
        // If the section doesn't exist, create the new section.
        sectionData.push({
          title: category,
          data: [{ id: ele.id, title: ele.title, price: ele.price }],
        });
        foundSections.push(category);
      }
    } else {
      throw Error(
        "getSectionListData error:\n Must provide valid menu items. The given data is not a menu item or doesn't have a category."
      );
    }
  });

  return sectionData;
}
