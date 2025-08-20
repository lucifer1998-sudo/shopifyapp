import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {authenticate} from "../shopify.server"
import {
  Page,
  IndexTable,
  Card,
  Text,
  Button,
} from "@shopify/polaris";

function sendQuestionnaireEmail(orderId){
  console.log(btoa(orderId.toString()),"ORDER ID")
  const link = `https://webhook.site/2f314413-d0bd-42dd-af07-07ebfb32c633`;
  fetch(link, { method: "GET" });
}

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const query = `#graphql
    query Orders($first: Int!) {
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            customer { displayName email }
            lineItems(first: 50) {
              edges {
                node {
                  product {
                    id
                    title
                    metafield(namespace: "custom", key: "requires_questionnaire") { value }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await admin.graphql(query, { variables: { first: 25 } });
  const data = await res.json();

  return json({ edges: data.data.orders.edges });
}

export default function QuestionnaireIndex() {
  const { edges } = useLoaderData();
  const filteredEdges = edges.filter(({ node }) =>
    node.lineItems?.edges?.some(e => e.node.product?.metafield?.value === "true")
  );

  return (
    <Page title="Questionnaire">
      <Card>
        <IndexTable
          resourceName={{ singular: "order", plural: "orders" }}
          itemCount={filteredEdges.length}
          selectable={false}
          headings={[
            { title: "Order ID" },
            { title: "Customer" },
            { title: "Actions" },
          ]}
        >
          {filteredEdges.map(({ node }, index) => {
            const numericId = node.id.split("/").pop();
            const hasPrescribery = node.lineItems?.edges?.some(e => e.node.product?.metafield?.value === "true");
            return (
              <IndexTable.Row id={node.id} key={node.id} position={index}>
                <IndexTable.Cell>
                  <Text as="span" fontWeight="semibold">{numericId}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span">{node.customer?.displayName ?? "—"}</Text>
                  <div>
                    <Text as="span" tone="subdued">{node.customer?.email ?? "—"}</Text>
                  </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  {hasPrescribery ? (
                    <Button onClick={() => sendQuestionnaireEmail(numericId)}>
                      Send Questionnaire Link
                    </Button>
                  ) : null}
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
      </Card>
    </Page>
  );
}