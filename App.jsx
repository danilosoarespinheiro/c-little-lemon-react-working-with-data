import { useEffect, useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  StatusBar,
  SafeAreaView,
  View,
  Text,
  SectionList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Searchbar } from "react-native-paper";
import {
  bgColour,
  pGreen,
  pSalmon,
  wH,
  wP,
  bP,
  sSalmon,
  highlight,
} from "./cssVariables";
import { sections } from "./constants";

import {
  createTable,
  getMenuItems,
  storeMenuItems,
  filterByQueryAndCategories,
  deleteAllMenuItems,
} from "./services/db";
import { fetchData } from "./services/api";

import debounce from "lodash.debounce";
import { getSectionListData } from "./utils/getSectionListData";
import { useUpdateEffect } from "./hooks/useUpdateEffect";

import Filters from "./components/Filters";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#495E57',
  },
  sectionList: {
    paddingHorizontal: 16,
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: '#495E57',
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    paddingVertical: 8,
    color: '#FBDABB',
    backgroundColor: '#495E57',
  },
  title: {
    fontSize: 20,
    color: 'white',
  },
  id: {
    display: 'none'
  },
});
StatusBar.setBarStyle("light-content");
StatusBar.setBackgroundColor(pGreen);

export default function App() {
  const [data, setData] = useState({ items: [], loading: true });

  const [searchBarText, setSearchBarText] = useState(""),
    [query, setQuery] = useState(""),
    [filterSelections, setFilterSelections] = useState(
      sections.map(() => false)
    );

  useEffect(() => {
    (async () => {
      try {
        await createTable();
        let menuItems = await getMenuItems();

        // If not stored in the database initially, fetch the initial data to initialize the database table.
        if (!menuItems.length) {
          console.log("storing...");
          menuItems = await fetchData();
          storeMenuItems(menuItems);
        } else if (menuItems[0].category === null) {
          await deleteAllMenuItems();
        }

        const sectionListData = getSectionListData(menuItems);
        setData({ items: sectionListData, loading: false });
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, []);

  useUpdateEffect(() => {
    (async () => {
      setData({ ...data, loading: true });
      const activeCategories = sections.filter((s, i) => {
        // If all filters are deselected, all categories are active.
        if (filterSelections.every((item) => item === false)) {
          return true;
        }
        return filterSelections[i];
      });
      try {
        const menuItems = await filterByQueryAndCategories(
            query,
            activeCategories
          ),
          sectionListData = getSectionListData(menuItems);
        setData({ items: sectionListData, loading: false });
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, [filterSelections, query]);

  const lookup = useCallback((q) => {
    setQuery(q);
  }, []);

  const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

  const handleSearchChange = (text) => {
    setSearchBarText(text);
    debouncedLookup(text);
  };

  const handleFiltersChange = async (index) => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index];
    setFilterSelections(arrayCopy);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: pGreen }}>
        <Searchbar
          placeholder="Search"
          placeholderTextColor={wP}
          onChangeText={handleSearchChange}
          value={searchBarText}
          style={styles.searchBar}
          iconColor={wH}
          inputStyle={{ color: wH }}
          elevation={0}
        />
      </View>
      {data.loading ? (
        <ActivityIndicator size="large" color={pSalmon} />
      ) : (
        <>
          <Filters
            selections={filterSelections}
            onChange={handleFiltersChange}
            sections={sections}
          />
          <SectionList
            sections={data.items}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
            renderItem={({ item }) => (
              <Item title={item.title} price={item.price} />
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const Item = ({ title, price }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.title}>${price}</Text>
  </View>
);
