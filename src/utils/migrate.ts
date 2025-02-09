import { COLLECTION_ALL_RECIPES, getAllRecipes } from "../recipes/getRecipes";
import { Upload } from "@aws-sdk/lib-storage";
import download from "download";
import { s3Client } from "./awsConfig";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { updateRecipe } from "@/recipes/addRecipe";
import { RecipeType } from "@/recipes/types";

const uploadToS3 = async (name: string, file: Buffer) => {
  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: "kr-smaczer-images",
      Key: `uploads/${name}`,
      Body: file,
    },
  });

  const res = await uploader.done();
  return res.Location;
};

const fileExists = async (name: string) => {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: "kr-smaczer-images",
        Key: `uploads/${name}`,
      })
    );
    return true;
  } catch (error) {
    return false;
  }
};

const migrateImage = async (image: string) => {
  if (!image) {
    return;
  }

  const fileName = image.split("/").pop() as string;
  // Check if exists in S3
  const exists = await fileExists(fileName);

  if (exists) {
    console.log("Image already exists in S3", image);
    return;
  }
  console.log("Downloading image", image);
  const downloadedImage = await download(image);

  console.log("Uploading image", fileName);

  const uploadedImage = await uploadToS3(fileName, downloadedImage);

  console.log("Uploaded image", fileName);
  return uploadedImage;
};

export const migrate = async (allRecipes: RecipeType[]) => {
  let count = 0;
  for (const recipe of allRecipes) {
    // migrate recipe here
    const mainImage = recipe.photoPath;
    const newMainImage = await migrateImage(mainImage);

    const imageXL = recipe.thumbnails.xl;
    const newImageXL = await migrateImage(imageXL);

    const newSteps = await Promise.all(
      recipe.steps.map(async (step, index) => {
        const image = step.photoPath;
        const newImage = await migrateImage(image);
        return {
          ...step,
          photoPath: newImage || image,
        };
      })
    );

    const newRecipe = {
      ...recipe,
      photoPath: newMainImage || mainImage,
      thumbnails: {
        ...recipe.thumbnails,
        xl: newImageXL || imageXL,
      },
      steps: newSteps,
    };

    console.log("Updating recipe", recipe.name);
    await updateRecipe(COLLECTION_ALL_RECIPES, newRecipe);
    count++;
  }

  console.log("Migrated", count, "recipes");
  return count;
};
