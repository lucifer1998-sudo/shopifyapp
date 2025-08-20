import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    console.log("=== CREATING METAFIELD DEFINITION ON APP INSTALL ===");

    // First, check if the metafield definition already exists
    const checkExistingResponse = await admin.graphql(`
      query GetMetafieldDefinitions($ownerType: MetafieldOwnerType!) {
        metafieldDefinitions(first: 250, ownerType: $ownerType) {
          edges {
            node {
              id
              namespace
              key
              name
            }
          }
        }
      }
    `, {
      variables: {
        ownerType: "PRODUCT"
      }
    });

    const existingDefinitions = await checkExistingResponse.json();
    console.log("Existing metafield definitions:", JSON.stringify(existingDefinitions, null, 2));

    // Check if our metafield definition already exists
    const existingDefinition = existingDefinitions.data?.metafieldDefinitions?.edges?.find(
      edge => edge.node.namespace === "custom" && (edge.node.key === "requires_questionnaire")
    );

    if (existingDefinition) {
      console.log("Metafield definition already exists, skipping creation");
      return json({ 
        success: true, 
        message: "Metafield definition already exists",
        metafieldDefinition: existingDefinition.node
      });
    }

    // Create metafield definition for "isprescriberyproduct" with pin property
    const metafieldDefinitionResponse = await admin.graphql(`
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
            namespace
            key
            description
            ownerType
            type {
              name
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `, {
      variables: {
        definition: {
          name: "Requires Questionnaire",
          namespace: "custom",
          key: "requires_questionnaire",
          description: "Indicates whether this product requires a questionnaire to be completed",
          type: "boolean",
          ownerType: "PRODUCT",
          pin: true,
          access: {
            storefront: "PUBLIC_READ"
          }
        }
      }
    });

    const metafieldDefinitionResult = await metafieldDefinitionResponse.json();
    console.log("Metafield definition creation result:", JSON.stringify(metafieldDefinitionResult, null, 2));

    if (metafieldDefinitionResult.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
      console.error("Error creating metafield definition:", metafieldDefinitionResult.data.metafieldDefinitionCreate.userErrors);
      return json({ 
        success: false, 
        error: "Failed to create metafield definition",
        details: metafieldDefinitionResult.data.metafieldDefinitionCreate.userErrors
      });
    }

    console.log("Successfully created metafield definition for requires_questionnaire");
    
    return json({ 
      success: true, 
      metafieldDefinition: metafieldDefinitionResult.data.metafieldDefinitionCreate.createdDefinition
    });

  } catch (error) {
    console.error("Error during app installation:", error);
    return json({ 
      success: false, 
      error: "App installation failed",
      details: error.message
    });
  }
};

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ message: "App installation endpoint" });
};
