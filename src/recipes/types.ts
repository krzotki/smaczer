import { ObjectId } from "mongodb";

export interface RecipeType {
  ingredientsCost?: string | null;
  _id: string;
  id: number;
  name: string;
  owner?: string;
  slug: string;
  description: string;
  sponsored: boolean;
  hideOnLatestSection: boolean;
  hideInMobileApplication: boolean;
  showRecipeDingButton: boolean;
  hideComments: boolean;
  blogUrl: string;
  kitchenTools: any;
  ogTitle: any;
  ingredients: Ingredient[];
  steps: Step[];
  recipePersonRange: RecipePersonRange;
  recipeTime: RecipeTime;
  recipeTimeMobile: string;
  type: string;
  photoPath: string;
  thumbnails: Thumbnails;
  originalImagePath: string;
  image: number;
  url: string;
  sponsoredButtonLink: any;
  sponsoredButtonText: any;
  plannedCount: number;
  printedCount: number;
  sentCount: number;
  visitCount: number;
  copiedCount: number;
  likesCount: number;
  commentCount: number;
  user: User;
  tags: Tag[];
  comments: any[];
  commentsWithImages: any[];
  recipeCategory: RecipeCategory;
  publicationAt: string;
  dishDay: string;
  isDishDay: boolean;
  videoUrl: string;
  contest: boolean;
  bigUpdate: boolean;
  contentSource: any;
  publishingRedactor: any;
  redactor: any;
  nonRecipe: any;
  contestIcon: string;
}

export interface Ingredient {
  id: string;
  name: string;
  items: Item[];
}

export interface Item {
  id: string;
  name: string;
  groupId: string;
}

export interface Step {
  description: string;
  image: any;
  photoPath: any;
  originalImageUrl: any;
}

export interface RecipePersonRange {
  label: string;
  value: number;
}

export interface RecipeTime {
  label: string;
  value: number;
}

export interface Thumbnails {
  lg: string;
  default: string;
  mini: string;
  sm: string;
  md: string;
  xl: string;
  content: string;
  recipe_main: string;
  comment_gallery: string;
  w80: string;
  w120: string;
  w160: string;
  w240: string;
  w320: string;
  w360: string;
  w540: string;
  w720: string;
  w1080: string;
  w1440: string;
  cover: string;
  article_content: string;
  contest: string;
  recipe_step: string;
}

export interface User {
  id: string;
  name: string;
  photoPath: string;
  email: string;
  sharedWith?: string[];
}

export interface Thumbnails2 {
  avatar: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface RecipeCategory {
  id: number;
  name: string;
  slug: string;
  url: string;
  photoPath: string;
}
