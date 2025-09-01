// src/types/json.d.ts

// Typage JSON sûr (évite "any")
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// Déclare l'import des .json comme valeur JSON typée
declare module "*.json" {
  const value: Json;
  export default value;
}
