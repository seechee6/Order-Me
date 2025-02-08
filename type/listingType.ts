export interface ListingType {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  location: string;
  rating: number;
  cuisine?: string;        // Optional field
  priceRange: string;     
  isOpen: boolean;       
  description: string;  
}