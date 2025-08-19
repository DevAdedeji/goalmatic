import { Search } from "@upstash/search";

type AgentContent = {
  name: string;
  description?: string;
};

type AgentMetadata = {
  public: boolean;
  creator_id: string;
  status?: string | number;
};

type FlowContent = {
  name: string;
  description?: string;
  type?: string;
};

type FlowMetadata = {
  public: boolean;
  creator_id: string;
  status?: string | number;
};

const getSearchClient = () =>
  new Search({
    url: process.env.UPSTASH_SEARCH_REST_URL as string,
    token: process.env.UPSTASH_SEARCH_REST_TOKEN as string,
  });

export const getAgentsIndex = () =>
  getSearchClient().index<AgentContent, AgentMetadata>("agents");

export const getFlowsIndex = () =>
  getSearchClient().index<FlowContent, FlowMetadata>("flows");

export const upsertAgentDoc = async (
  id: string,
  content: AgentContent,
  metadata: AgentMetadata
) => {
  const index = getAgentsIndex();
  await index.upsert([
    {
      id,
      content,
      metadata,
    },
  ]);
};

export const deleteAgentDoc = async (id: string) => {
  const index = getAgentsIndex();
  await index.delete({ ids: [id] });
};

export const upsertFlowDoc = async (
  id: string,
  content: FlowContent,
  metadata: FlowMetadata
) => {
  const index = getFlowsIndex();
  await index.upsert([
    {
      id,
      content,
      metadata,
    },
  ]);
};

export const deleteFlowDoc = async (id: string) => {
  const index = getFlowsIndex();
  await index.delete({ ids: [id] });
};

