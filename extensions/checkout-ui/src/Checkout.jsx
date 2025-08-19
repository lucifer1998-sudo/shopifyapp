import {
  reactExtension,
  Banner,
  Link,
  Text,
  useApi,
  useCartLineTarget,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.thank-you.block.render", () => (
  <Extension />
));

function Extension() {
  
  const { query } = useApi();
  const target = useCartLineTarget();
  
  useEffect(() => {
    async function getProductMetaFields(){
      const result = await query(`{
          product(id : "${target.merchandise.product.id}"){
            metafield(namespace : "custom", key: "snowboard_binding_amount"){
              value
            }
          }
        }`);
      
      console.log(result,"RESULT");
    }

    getProductMetaFields();
  },[query, target.merchandise.product.id])

  return (
    <Banner title="Submit Questionnaire">
      <Text size="medium">
        Please <Link to="https://www.service.prescribery.com"> click here </Link> to submit the questionnaire
      </Text>
    </Banner>
  );

}