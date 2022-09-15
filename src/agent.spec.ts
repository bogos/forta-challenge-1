import { Finding, FindingSeverity, FindingType, HandleTransaction } from "forta-agent";
import { TestTransactionEvent, createAddress } from "forta-agent-tools/lib/tests";
import {
  CREATE_AGENT_METHOD,
  DEPLOYER_ADDRESS,
  FORTA_PROXY_AGENT_REGISTRY_CORE,
  handlerInputs,
  providerHandleTransaction,
} from "./agent";
import { Interface } from "ethers/lib/utils";
import { BigNumber } from "ethers";

const FAKE_DATA_0 = {
  agentId: BigNumber.from("1111"),
  owner: createAddress("0x"),
  metadata: "QmPkydGrmSK2roUJeNzsdC3e7Yetr7zb7UNdmiXyRUM6i7",
  chainIds: [BigNumber.from("2222")],
};

const FAKE_DATA_1 = {
  agentId: BigNumber.from("3333"),
  owner: createAddress("0x1"),
  metadata: "QmPkydGrmSK2roUJeNzsdC3e7Yetr7zb7UNdmiXyRUM6i7",
  chainIds: [BigNumber.from("4444")],
};

describe("New Forta Agent deployment", () => {
  let handleTransaction: HandleTransaction;
  let fortaProxy = new Interface([CREATE_AGENT_METHOD]);

  beforeAll(() => {
    handleTransaction = providerHandleTransaction(handlerInputs);
  });

  it("returns empty findings if the deployer address not create a new agent", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns findings if there is a bot deployment", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom(DEPLOYER_ADDRESS)
      .setTo(FORTA_PROXY_AGENT_REGISTRY_CORE)
      .addTraces({
        to: FORTA_PROXY_AGENT_REGISTRY_CORE,
        input: fortaProxy.encodeFunctionData("createAgent", [
          FAKE_DATA_0.agentId,
          FAKE_DATA_0.owner,
          FAKE_DATA_0.metadata,
          FAKE_DATA_0.chainIds,
        ]),
      });
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Create Agent",
        description: `Forta bot deployed by Nethermind`,
        alertId: "NM-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: FAKE_DATA_0.agentId.toString(),
          owner: FAKE_DATA_0.owner,
          metadata: FAKE_DATA_0.metadata,
          chainIds: FAKE_DATA_0.chainIds.toString(),
        },
      }),
    ]);
  });

  it("returns no finding for other deployer", async () => {
    const OTHER_DEPLOYER = createAddress("0x1");
    const txEvent = new TestTransactionEvent()
      .setFrom(OTHER_DEPLOYER)
      .setTo(FORTA_PROXY_AGENT_REGISTRY_CORE)
      .addTraces({
        to: FORTA_PROXY_AGENT_REGISTRY_CORE,
        input: fortaProxy.encodeFunctionData("createAgent", [
          FAKE_DATA_0.agentId,
          FAKE_DATA_0.owner,
          FAKE_DATA_0.metadata,
          FAKE_DATA_0.chainIds,
        ]),
      });

    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("multiple findings for multiple deployment by Nethermind", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom(DEPLOYER_ADDRESS)
      .setTo(FORTA_PROXY_AGENT_REGISTRY_CORE)
      .addTraces({
        to: FORTA_PROXY_AGENT_REGISTRY_CORE,
        input: fortaProxy.encodeFunctionData("createAgent", [
          FAKE_DATA_0.agentId,
          FAKE_DATA_0.owner,
          FAKE_DATA_0.metadata,
          FAKE_DATA_0.chainIds,
        ]),
      })
      .addTraces({
        to: FORTA_PROXY_AGENT_REGISTRY_CORE,
        input: fortaProxy.encodeFunctionData("createAgent", [
          FAKE_DATA_1.agentId,
          FAKE_DATA_1.owner,
          FAKE_DATA_1.metadata,
          FAKE_DATA_1.chainIds,
        ]),
      });
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Create Agent",
        description: `Forta bot deployed by Nethermind`,
        alertId: "NM-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: FAKE_DATA_0.agentId.toString(),
          owner: FAKE_DATA_0.owner,
          metadata: FAKE_DATA_0.metadata,
          chainIds: FAKE_DATA_0.chainIds.toString(),
        },
      }),
      Finding.fromObject({
        name: "Create Agent",
        description: `Forta bot deployed by Nethermind`,
        alertId: "NM-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: FAKE_DATA_1.agentId.toString(),
          owner: FAKE_DATA_1.owner,
          metadata: FAKE_DATA_1.metadata,
          chainIds: FAKE_DATA_1.chainIds.toString(),
        },
      }),
    ]);
  });
});
