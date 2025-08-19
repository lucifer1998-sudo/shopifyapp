import {
  reactExtension,
  Banner,
  Link,
  Text,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
export default reactExtension("purchase.thank-you.block.render", () => (
  <Extension />
));

function Extension() {
  const data = useApi();
  const orderId = data.orderConfirmation.current.order.id; //gid://shopify/OrderIdentity/6747217789089

  return (
    <Banner title="Thank you for your order!">
      <Text size="medium">
        Please <Link to={`https://www.service.prescribery.com?id=${btoa(orderId)}`}> click here </Link> to submit the questionnaire
      </Text>
    </Banner>
  );
}