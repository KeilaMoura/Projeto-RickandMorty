import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedText } from "../../components/ThemedText";
import { Platform } from "react-native";
import CharacterCard from "../../components/CharacterCard";

interface Character {
  id: number;
  name: string;
  species: string;
  image: string;
  liked: boolean;
  gender: string;
  status: string;
  type: string;
  origin: { name: string };
  location: { name: string };
}

const LikeScreen: React.FC = () => {
  const [personagens, setPersonagens] = useState<Character[]>([]);
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      carregarPersonagensCurtidos();
    }, [])
  );

  const carregarPersonagensCurtidos = async () => {
    setLoading(true);
    try {
      const savedLikes = await AsyncStorage.getItem("@liked_personagens");
      if (savedLikes) {
        const likedPersonagensIds: number[] = JSON.parse(savedLikes);

        if (likedPersonagensIds.length > 0) {
          const response = await fetch(
            `https://rickandmortyapi.com/api/character/${likedPersonagensIds.join(
              ","
            )}`
          );
          const data = await response.json();

          const personagensCurtidos: Character[] = Array.isArray(data)
            ? data.map((item: any) => ({
                id: item.id,
                name: item.name,
                species: item.species,
                image: item.image,
                liked: true,
                gender: item.gender,
                status: item.status,
                type: item.type || "Unknown",
                origin: { name: item.origin.name },
                location: { name: item.location.name },
              }))
            : [
                {
                  id: data.id,
                  name: data.name,
                  species: data.species,
                  image: data.image,
                  liked: true,
                  gender: data.gender,
                  status: data.status,
                  type: data.type || "Unknown",
                  origin: { name: data.origin.name },
                  location: { name: data.location.name },
                },
              ];

          setPersonagens((prevPersonagens) => {
            const personagensMap = new Map<number, Character>();
            prevPersonagens.forEach((p) => personagensMap.set(p.id, p));
            personagensCurtidos.forEach((p) => personagensMap.set(p.id, p));
            return Array.from(personagensMap.values());
          });
        }
      } else {
        setPersonagens([]);
      }
    } catch (error) {
      console.error("Erro ao carregar personagens curtidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = useCallback(
    async (personagem: Character) => {
      try {
        const updatedPersonagens = personagens.map((p) =>
          p.id === personagem.id ? { ...p, liked: !p.liked } : p
        );

        const likedPersonagensIds = updatedPersonagens
          .filter((p) => p.liked)
          .map((p) => p.id);

        await AsyncStorage.setItem(
          "@liked_personagens",
          JSON.stringify(likedPersonagensIds)
        );

        setPersonagens(updatedPersonagens);
      } catch (error) {
        console.error("Erro ao salvar curtida:", error);
      }
    },
    [personagens]
  );

  const showCharacterDetails = (personagem: Character) => {
    setSelectedCharacter(personagem);
  };

  const goBack = () => {
    setSelectedCharacter(null);
  };

  const renderCharacter = ({ item }: { item: Character }) => (
    <TouchableOpacity
      style={styles.characterCard}
      onPress={() => showCharacterDetails(item)}
    >
      <Image source={{ uri: item.image }} style={styles.characterImage} />
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.characterName}>{item.name}</ThemedText>
          <ThemedText style={styles.characterSpecies}>
            {item.species}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => toggleLike(item)}
          style={styles.heartIcon}
        >
          <Icon
            name={item.liked ? "heart" : "heart-outline"}
            size={24}
            color={item.liked ? "#FF6347" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDetails = () => (
    <View style={styles.detailsContainer}>
      <Image
        source={require("../../assets/images/AppBar.png")}
        style={[
          styles.headerImage,
          { position: "absolute", top: 25, left: 0, right: 0 },
        ]}
      />
      <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
        <Icon name="arrow-back-outline" size={24} color="#000000" />
        <Text style={styles.goBackText}>GO BACK</Text>
      </TouchableOpacity>
      <Image
        source={{ uri: selectedCharacter?.image }}
        style={styles.detailsImage}
      />
      <View style={styles.detailsContent}>
        <Text style={styles.detailsTitle}>{selectedCharacter?.name}</Text>
        <Text style={styles.informationsTitle}>Informations</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Gender:</Text>
          <Text style={styles.detailsText}>{selectedCharacter?.gender}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Status:</Text>
          <Text style={styles.detailsText}>{selectedCharacter?.status}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Specie:</Text>
          <Text style={styles.detailsText}>{selectedCharacter?.species}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Type:</Text>
          <Text style={styles.detailsText}>{selectedCharacter?.type}</Text>
        </View>

        <View style={styles.separator} />
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Origin:</Text>
          <Text style={styles.detailsText}>
            {selectedCharacter?.origin.name}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Localization:</Text>
          <Text style={styles.detailsText}>
            {selectedCharacter?.location.name}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!selectedCharacter ? (
        <>
          <View style={styles.headerContainer}>
            <Image
              source={require("../../assets/images/AppBar.png")}
              style={styles.headerImage}
            />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Filter by name..."
                placeholderTextColor="#00000080"
                onChangeText={(text) => setTermoBusca(text)}
                value={termoBusca}
              />
              <TouchableOpacity
                onPress={carregarPersonagensCurtidos}
                style={styles.searchIcon}
              >
                <Icon name="search" size={20} color="#0000008A" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={personagens.filter((personagem) =>
                personagem.name.toLowerCase().includes(termoBusca.toLowerCase())
              )}
              renderItem={({ item }) => (
                <CharacterCard
                  personagem={item}
                  onPress={() => showCharacterDetails(item)}
                  onLike={() => toggleLike(item)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.characterContainer}
            />
          )}
        </>
      ) : (
        renderDetails()
      )}
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    width: 360,
    height: 60,
    top: 25,
    marginBottom: 50,
  },
  headerImage: {
    flex: 1,
    width: 380,
    height: 60,
    resizeMode: "cover",
  },
  searchContainer: {
    paddingHorizontal: 35,
    marginBottom: 30,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000080",
    borderRadius: 8,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    width: 312,
    height: 56,
  },
  searchInput: {
    flex: 1,
    height: 56,
    color: "#333",
  },
  searchIcon: {
    padding: 10,
    right: 230,
  },
  characterContainer: {
    paddingHorizontal: 35,
  },
  characterCard: {
    width: 312,
    height: 308,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    overflow: "hidden",
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  characterImage: {
    width: "100%",
    height: 23,
    resizeMode: "cover",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    height: 76,
  },
  textContainer: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  characterSpecies: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  heartIcon: {
    marginLeft: 10,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 20,
  },
  detailsImage: {
    width: 146,
    height: 148,
    borderRadius: 150,
    borderWidth: 5,
    borderColor: "#F2F2F7",
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: 115,
    marginBottom: 20,
  },
  detailsContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  detailsTitle: {
    fontSize: 28,
    marginTop: -30,
    marginBottom: 15,
    width: 312,
    height: 38,
    textAlign: "center",
    color: "#081F32",
  },
  informationsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#8E8E93",
  },
  detailsRow: {
    marginBottom: 5,
  },
  detailsLabel: {
    fontWeight: "bold",
    color: "#081F32",
    fontSize: 16,
  },
  detailsText: {
    marginTop: 1,
    color: "#6E798C",
  },
  goBackButton: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    left: 20,
    zIndex: 1,
  },
  goBackText: {
    marginLeft: 10,
    color: "#000000",
    width: 76,
    height: 18,
    fontWeight: "bold",
  },
  separator: {
    borderBottomColor: "#cccccc",
    borderBottomWidth: 1,
    opacity: 0.5,
    marginVertical: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#333",
  },
});

export default LikeScreen;
