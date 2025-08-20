import {
  reactExtension,
  Banner,
  Link,
  Text,
  useApi,
  useAppMetafields,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.thank-you.block.render", () => (
  <Extension />
));

function Extension() {
  const { orderConfirmation } = useApi();
  const metafields = useAppMetafields({
    namespace: "custom",
    key: "requires_questionnaire",
  });
  
  console.log("=== CHECKOUT EXTENSION DEBUGs ===");
  console.log("Metafields array:", metafields);
  console.log("Metafields length:", metafields.length);
  
  // Log each metafield individually
  metafields.forEach((item, index) => {
    console.log(`Metafield ${index}:`, item);
    if (item.metafield) {
      console.log(`  - Key: ${item.metafield.key}`);
      console.log(`  - Value: ${item.metafield.value}`);
      console.log(`  - Namespaces: ${item.metafield.namespace}`);
    }
  });
  
  const requiresQuestionnaire = metafields.some(
    (m) => m.metafield && m.metafield.key === 'requires_questionnaire' && m.metafield.value === 'true'
  );

  console.log("Requires questionnaire:", requiresQuestionnaire);
  
  const orderGid = orderConfirmation.current.order.id; //gid://shopify/OrderIdentity/6747217789089
  const orderId = orderGid.split("/").pop(); // "6747217789089"
  
  console.log("Order GID:", orderGid);
  console.log("Order ID:", orderId);

  // Generate encoded link for prescription orders
  const encodedOrderId = btoa(orderId.toString());
  const encodedLink = `https://service.prescribery.com?id=${encodedOrderId}`;
  
  console.log("Encoded order ID:", encodedOrderId);
  console.log("Encoded link:", encodedLink);

  return (
    requiresQuestionnaire ? (
      <Banner title="Thank you for your order!">
        <Text size="medium">
          Please{" "}
          <Link to={encodedLink}>
            click here
          </Link>{" "}
          to submit the questionnaire
        </Text>
      </Banner>
    ) : null
  );
}