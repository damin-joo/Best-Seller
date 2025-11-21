import { StyleSheet } from "react-native";

export const GlobalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    paddingVertical: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  button: {
    backgroundColor: "#eeffc2ff",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#484848ff",
    fontWeight: "bold",
    fontSize: 16,
  },
  row: {
    justifyContent: "center",
    marginBottom: 16,
  },
  book: {
    width: 150,        // book width
    height: 200,      // book height
    backgroundColor: "#d8b384",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 1, height: 2 },
    elevation: 3,     // Android shadow
    marginBottom: 10,
    margin: 10,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  shelf: {

  },
});