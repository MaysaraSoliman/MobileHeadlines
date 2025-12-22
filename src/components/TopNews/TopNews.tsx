import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import ScreenNames from "../../navigation/ScreenNames";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  ArticleDetails: { item: any };
};

type TopNewsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TopNews({
  ListHeaderComponent,
  onRefresh,
}: Readonly<{
  ListHeaderComponent?: React.ReactElement;
  onRefresh?: () => Promise<void>;
}>) {
  const [news, setNews] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { navigate } = useNavigation<TopNewsNavigationProp>();

  const fetchNews = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&page=${page}&pageSize=5&apiKey=bb57ede0b4c44de2ad14acd549d5caff`
      );

      setNews((prev: any) => {
        const newArticles = res.data.articles.filter(
          (item: any) => item.urlToImage
        );
        return page === 1 ? newArticles : [...prev, ...newArticles];
      });
    } catch (error: any) {
      console.log("FETCH ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  const renderNews = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigate(ScreenNames.ArticleDetails, { item })}
      >
        <Image
          source={{ uri: item.urlToImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.descriptionText}>{item.publishedAt}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={news}
      renderItem={renderNews}
      contentContainerStyle={styles.cardContainer}
      onEndReached={() => {
        if (!loading) setPage((p) => p + 1);
      }}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Top News</Text>
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    margin: 10,
    padding: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  cardContainer: {
    paddingBottom: 20,
    marginHorizontal: 10,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  image: {
    width: 100,
    height: "100%",
  },
  content: {
    padding: 10,
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
  },
});
