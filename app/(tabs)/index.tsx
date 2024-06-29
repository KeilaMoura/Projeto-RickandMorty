import React, { useState, useEffect } from "react";
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
import CharacterCard from "../../components/CharacterCard";
import { Platform } from "react-native";

interface Character {
  id: number;
  name: string;
  species: string;
  type: string;
  image: string;
  liked: boolean;
  gender: string;
  status: string;
  origin: { name: string };
  location: { name: string };
}

const HomeScreen: React.FC = () => {
  const [personagens, setPersonagens] = useState<Character[]>([]);
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResultEmpty, setSearchResultEmpty] = useState<boolean>(false);

  useEffect(() => {
    buscarPersonagens();
  }, [page]);

  useEffect(() => {
    carregarCurtidas();
  }, []);

  // Função para buscar personagens da API
  const buscarPersonagens = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `https://rickandmortyapi.com/api/character?page=${page}`
      );

      const data = await response.json();
      const characterList = data.results.map((personagem: any) => ({
        id: personagem.id,
        name: personagem.name,
        species: personagem.species,
        type: personagem.type || "Unknown", // Inclui o campo 'type' da API
        image: personagem.image,
        liked: false,
        gender: personagem.gender,
        status: personagem.status,
        origin: { name: personagem.origin.name },
        location: { name: personagem.location.name },
      }));

      // Carrega curtidas salvas do AsyncStorage
      const savedLikes = await AsyncStorage.getItem("@liked_personagens");
      if (savedLikes) {
        const likedPersonagens = JSON.parse(savedLikes) as number[];
        // Marca como curtido os personagens salvos
        characterList.forEach((personagem: Character) => {
          if (likedPersonagens.includes(personagem.id)) {
            personagem.liked = true;
          }
        });
      }

      // Filtra personagens que já estão na lista para evitar repetição
      const filteredCharacters = characterList.filter(
        (newCharacter: { id: number }) =>
          !personagens.some((p) => p.id === newCharacter.id)
      );

      // Adiciona novos personagens à lista existente
      setPersonagens((prevPersonagens) => [
        ...prevPersonagens,
        ...filteredCharacters,
      ]);
      setHasMore(data.info.next !== null);
    } catch (error) {
      console.error("Erro ao buscar personagens:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega as curtidas salvas do AsyncStorage ao iniciar a tela
  const carregarCurtidas = async () => {
    try {
      const savedLikes = await AsyncStorage.getItem("@liked_personagens");
      if (savedLikes) {
        const likedPersonagens = JSON.parse(savedLikes);
        // Marca como curtido os personagens salvos
        setPersonagens((prevPersonagens) =>
          prevPersonagens.map((personagem) => ({
            ...personagem,
            liked: likedPersonagens.includes(personagem.id),
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar curtidas:", error);
    }
  };

  // Salva as curtidas no AsyncStorage
  const salvarCurtidas = async (likedPersonagens: number[]) => {
    try {
      await AsyncStorage.setItem(
        "@liked_personagens",
        JSON.stringify(likedPersonagens)
      );
    } catch (error) {
      console.error("Erro ao salvar curtidas:", error);
    }
  };

  // Carrega mais personagens ao alcançar o fim da lista
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Alterna a curtida de um personagem
  const toggleLike = (personagem: Character) => {
    // Verifica se o personagem está sendo desfavoritado
    const isUnliking = personagem.liked;

    // Atualiza o estado local dos personagens
    const updatedPersonagens = personagens.map((p) =>
      p.id === personagem.id ? { ...p, liked: !p.liked } : p
    );
    setPersonagens(updatedPersonagens);

    // Obtém a lista de personagens curtidos
    const likedPersonagens = updatedPersonagens
      .filter((p) => p.liked)
      .map((p) => p.id);

    // Salva as curtidas atualizadas no AsyncStorage
    salvarCurtidas(likedPersonagens);

    // Se estiver desfavoritando e estiver na tela de detalhes, volta para a lista
    if (isUnliking && selectedCharacter?.id === personagem.id) {
      goBack();
    }
  };

  // Mostra os detalhes de um personagem
  const showCharacterDetails = (personagem: Character) => {
    setSelectedCharacter(personagem);
  };

  // Volta para a lista de personagens
  const goBack = () => {
    setSelectedCharacter(null);
  };

  // Função para buscar personagem por nome
  const buscarPersonagemPorNome = async (nome: string) => {
    if (loading) return;

    setSearching(true);

    try {
      const response = await fetch(
        `https://rickandmortyapi.com/api/character/?name=${nome}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const fetchedCharacters = data.results.map((personagem: any) => ({
          id: personagem.id,
          name: personagem.name,
          species: personagem.species,
          type: personagem.type, // Inclui o campo 'type' da API
          image: personagem.image,
          liked: false,
          gender: personagem.gender,
          status: personagem.status,
          origin: { name: personagem.origin.name },
          location: { name: personagem.location.name },
        }));

        // Carrega curtidas salvas do AsyncStorage
        const savedLikes = await AsyncStorage.getItem("@liked_personagens");
        if (savedLikes) {
          const likedPersonagens = JSON.parse(savedLikes) as number[];
          // Marca como curtido os personagens salvos
          fetchedCharacters.forEach((personagem: Character) => {
            if (likedPersonagens.includes(personagem.id)) {
              personagem.liked = true;
            }
          });
        }

        // Filtra personagens que já estão na lista para evitar repetição
        const filteredCharacters = fetchedCharacters.filter(
          (newCharacter: any, index: any, self: any[]) =>
            index === self.findIndex((t) => t.id === newCharacter.id)
        );

        // Atualiza a lista de personagens com o resultado da busca
        setPersonagens(filteredCharacters);
        setSearchResultEmpty(false); // Resetamos para falso, pois encontramos resultados
      } else {
        setPersonagens([]);
        setSearchResultEmpty(true); // Indicamos que não encontramos resultados
      }
    } catch (error) {
      console.error("Erro ao buscar personagem por nome:", error);
      setPersonagens([]);
    } finally {
      setSearching(false);
    }
  };

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
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/pngRicky.png")}
              style={styles.mainImage}
            />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Filter by name..."
                placeholderTextColor="#00000080"
                onChangeText={(text) => {
                  setTermoBusca(text);
                  if (text.length > 0) {
                    setSearchResultEmpty(false);
                    buscarPersonagemPorNome(text);
                  } else {
                    setPage(1);
                    setPersonagens([]);
                    buscarPersonagens();
                  }
                }}
                value={termoBusca}
              />
              <TouchableOpacity onPress={() => {}} style={styles.searchIcon}>
                <Icon name="search" size={20} color=" #0000008A" />
              </TouchableOpacity>
            </View>
          </View>

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
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : null
            }
            ListEmptyComponent={() =>
              searching && searchResultEmpty ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Nenhum personagem encontrado
                  </Text>
                </View>
              ) : null
            }
          />
        </>
      ) : (
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
            source={{ uri: selectedCharacter.image }}
            style={styles.detailsImage}
          />
          <View style={styles.detailsContent}>
            <Text style={styles.detailsTitle}>{selectedCharacter.name}</Text>
            <Text style={styles.informationsTitle}>Informations</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Gender:</Text>
              <Text style={styles.detailsText}>{selectedCharacter.gender}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Status:</Text>
              <Text style={styles.detailsText}>{selectedCharacter.status}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Specie:</Text>
              <Text style={styles.detailsText}>
                {selectedCharacter.species}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Type:</Text>
              <Text style={styles.detailsText}>{selectedCharacter.type}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Origin:</Text>
              <Text style={styles.detailsText}>
                {selectedCharacter.origin.name}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Localization:</Text>
              <Text style={styles.detailsText}>
                {selectedCharacter.location.name}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainImage: {
    width: 312,
    height: 104,
    resizeMode: "contain",
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
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 20,
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

export default HomeScreen;
