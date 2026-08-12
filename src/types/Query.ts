import { SearchPayload } from "./Search";

export type Query = {
    query: string;
    object: string;
    color: string;
    ocr: string;
    asr: string;
}

export type Item = {
    img: string;
    title: string
}

export type QueryProps = {  
    handleSearch: (searchPayload: SearchPayload) => void;
    searching: boolean
}


export type ImageGalleryProps = {
  results: any[]; 
  cols: number;
  className?: string
};

export type SearchContextType = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  queryName: string;
  setQueryName: React.Dispatch<React.SetStateAction<string>>;
  dataSource: string;
  setDataSource: React.Dispatch<React.SetStateAction<string>>;
  topK: number;
  setTopK: React.Dispatch<React.SetStateAction<number>>;
  numQuery: number;
  setNumQuery: React.Dispatch<React.SetStateAction<number>>;
};

export type SearchResultContextType = {
  results: any[];
  searching: boolean;
  handleSearch: (searchPaylod: SearchPayload) => void;
  cols: number | "";
  setCols: React.Dispatch<React.SetStateAction<number | "">>;
};

export type IgnoreContextType = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

}