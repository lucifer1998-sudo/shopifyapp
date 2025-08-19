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
    key: "isprescribery",
  });
  const hasPrescribery = metafields.some(
    (m) => m.metafield.key === 'isprescribery' && m.metafield.value === 'true'
  );

  console.log(hasPrescribery,'hasprescribery');
  const orderId = orderConfirmation.current.order.id; //gid://shopify/OrderIdentity/6747217789089

  return (
    hasPrescribery ? (
      <Banner title="Thank you for your order!">
        <Text size="medium">
          Please{" "}
          <Link to={`https://www.service.prescribery.com?id=${btoa(orderId)}`}>
            click here
          </Link>{" "}
          to submit the questionnaire
        </Text>
      </Banner>
    ) : null
  );
}