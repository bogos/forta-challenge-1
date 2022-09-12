import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const DEPLOYER_ADDRESS = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";
export const FORTA_PROXY_AGENT_REGISTRTY_CORE =
  "0x61447385B019187daa48e91c55c02AF1F1f3F863";
export const CREATE_AGENT_METHOD =
  "function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds)";

export const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];
  if (txEvent.from != DEPLOYER_ADDRESS.toLowerCase()) return findings;

  const createAgentMethodCalls = txEvent.filterFunction(
    CREATE_AGENT_METHOD,
    FORTA_PROXY_AGENT_REGISTRTY_CORE
  );
  createAgentMethodCalls.forEach((methodCall) => {
    const { agentId, chainIds, owner, metadata } = methodCall.args;
    findings.push(
      Finding.fromObject({
        name: "Create Agent",
        description: `Forta bot deployed by Nethermind`,
        alertId: "NM-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: agentId.toString(),
          owner,
          chainIds: chainIds.toString(),
          metadata,
        },
      })
    );
  });
  return findings;
};

export default {
  handleTransaction,
};
