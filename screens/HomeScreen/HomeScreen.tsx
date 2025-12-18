import React from "react";
import { StyleSheet } from "react-native";
import Header from "../../src/components/Header/Header";
import Hero from "../../src/components/Hero/Hero";
import TopNews from "../../src/components/TopNews/TopNews";

export default function HomeScreen() {
  return (
    <TopNews
      ListHeaderComponent={
        <>
          <Header />
          <Hero />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({});
