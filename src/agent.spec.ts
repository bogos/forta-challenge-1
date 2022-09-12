import { Finding, FindingSeverity, FindingType, HandleTransaction } from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/tests";
import {
  CREATE_AGENT_METHOD,
  DEPLOYER_ADDRESS,
  FORTA_PROXY_AGENT_REGISTRTY_CORE,
  handlerInputs,
  providerHandleTransaction,
} from "./agent";
import { Interface } from "ethers/lib/utils";
import { BigNumber } from "ethers";

const FAKE_DATA = {
  agentId: BigNumber.from("1111"),
  owner: "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8",
  metadata: "QmPkydGrmSK2roUJeNzsdC3e7Yetr7zb7UNdmiXyRUM6i7",
  chainIds: [BigNumber.from("2222")],
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
      .setTo(FORTA_PROXY_AGENT_REGISTRTY_CORE)
      .addTraces({
        to: FORTA_PROXY_AGENT_REGISTRTY_CORE,
        input: fortaProxy.encodeFunctionData("createAgent", [
          FAKE_DATA.agentId,
          FAKE_DATA.owner,
          FAKE_DATA.metadata,
          FAKE_DATA.chainIds,
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
          agentId: FAKE_DATA.agentId.toString(),
          owner: FAKE_DATA.owner,
          metadata: FAKE_DATA.metadata,
          chainIds: FAKE_DATA.chainIds.toString(),
        },
      }),
    ]);
  });
});
