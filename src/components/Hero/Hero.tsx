import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import ScreenNames from "../../navigation/ScreenNames";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NewsArticle } from "../../types/types";

type RootStackParamList = {
  ArticleDetails: { item: any };
};

type HeroNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.9;
const ITEM_SPACING = 10; // marginHorizontal * 2

export default function Hero() {
  const [news, setNews] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { navigate } = useNavigation<HeroNavigationProp>();

  const fetchNews = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&page=${page}&pageSize=5&apiKey=5fc9bc51a87643a3a0ed7efb2127a151`
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

  const renderNews = ({ item }: { item: NewsArticle }) => {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => navigate(ScreenNames.ArticleDetails, { item })}
      >
        <ImageBackground
          source={{ uri: item.urlToImage || undefined }}
          style={styles.backgroundImage}
        >
          <View style={styles.content}>
            <View style={styles.title}>
              <Text style={styles.titleText}>{item.title}</Text>
            </View>
            <View style={styles.description}>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      renderItem={renderNews}
      data={news}
      horizontal
      onEndReached={() => setPage((p) => p + 1)}
      onEndReachedThreshold={0.5}
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH + ITEM_SPACING}
      decelerationRate="fast"
      snapToAlignment="center"
      contentContainerStyle={{
        paddingHorizontal: (width - (ITEM_WIDTH + ITEM_SPACING)) / 2,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginHorizontal: 5,
    marginVertical: 20,
  },
  backgroundImage: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    height: 300,
    overflow: "hidden",
    borderRadius: 20,
  },
  content: {
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 30,
    borderRadius: 20,
  },
  title: {
    marginBottom: 10,
    backgroundColor: "red",
    padding: 5,
    alignSelf: "flex-start",
  },
  description: {},
  titleText: {
    color: "#fff",
  },
  descriptionText: {},
});
