import { useState, useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';

// import cosmwasm client generated with cosmwasm-ts-codegen
import { LaunchClient, LaunchQueryClient } from '../codegen/launch/Launch.client';
import { chainName, testnetAddrs } from '../config';

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/cosmwasmclient';
import { SigningCosmWasmClient, SigningCosmWasmClientOptions } from '@cosmjs/cosmwasm-stargate';
import { OracleClient, OracleQueryClient } from '../codegen/oracle/Oracle.client';
import { PositionsClient, PositionsQueryClient } from '../codegen/positions/Positions.client';
import { LiquidationQueueClient, LiquidationQueueQueryClient } from '../codegen/liquidation_queue/LiquidationQueue.client';
import { StabilityPoolClient, StabilityPoolQueryClient } from '../codegen/stability_pool/StabilityPool.client';
import { GovernanceClient, GovernanceQueryClient } from '../codegen/governance/Governance.client';
import { StakingClient, StakingQueryClient } from '../codegen/staking/Staking.client';
import { VestingClient } from '../codegen/vesting/Vesting.client';
import { GasPrice } from '@cosmjs/stargate';
import { aminoTypes, registry } from '../config/defaults';

export function useClients(): {
  cdp_client: PositionsClient | null;
  launch_client: LaunchClient | null; 
  liq_queue_client: LiquidationQueueClient | null;
  stability_pool_client: StabilityPoolClient | null;
  governance_client: GovernanceClient | null;
  staking_client: StakingClient | null;
  vesting_client: VestingClient | null;
  base_client: SigningCosmWasmClient | null;
  address: String | undefined;
} {
  const { getSigningCosmWasmClient, address, status, getOfflineSigner } = useChain(chainName);
  
  const [launchClient, setlaunchClient] = useState<LaunchClient | null>(  null  );
  const [cdpClient, setcdpClient] = useState<PositionsClient | null>(  null  );
  const [liqqueueClient, setliqqueueClient] = useState<LiquidationQueueClient | null>(  null  );
  const [stabilitypoolClient, setstabilitypoolClient] = useState<StabilityPoolClient | null>(  null  );
  const [governanceClient, setgovernanceClient] = useState<GovernanceClient | null>(  null  );
  const [stakingClient, setstakingClient] = useState<StakingClient | null>(  null  );
  const [vestingClient, setvestingClient] = useState<VestingClient | null>(  null  );
  const [cosmwasmClient, setCosmwasmClient] = useState<SigningCosmWasmClient | null>(  null  );

  var signed_errored = false;

  useEffect(() => { 
    if (status === 'Connected') {

      signed_errored = false;      
      
      ///I can change the RPC node here
      //https://rpc.osmotest5.osmosis.zone/
      //https://g.w.lavanet.xyz:443/gateway/cos3/rpc-http/bb6d2019c50124ec4fdb78498bc50573
      //Reece's: osmosis-rpc.reece.sh
      //Polkachu's: https://osmosis-rpc.polkachu.com/
      //Meta: https://rpc.cosmos.directory/osmosis (list of RPCs: https://cosmos.directory/osmosis/nodes)
      const signer = getOfflineSigner();
      
      var client = SigningCosmWasmClient.connectWithSigner(
        'https://osmosis-rpc.polkachu.com/', 
        signer,
        {
          registry,
          aminoTypes,
          gasPrice: GasPrice.fromString('0.025uosmo')
        }
      ).catch((e) => {
        console.log(e);
        signed_errored = true;
      });
      if (signed_errored) {
        client = getSigningCosmWasmClient();
      }

      client.then((cosmwasmClient) => {
        if (!cosmwasmClient || !address) {
          console.error('cosmwasmClient undefined or address undefined.');
          return;
        }

        console.log({address, status});
        
        //Set Clients
        setCosmwasmClient(cosmwasmClient);
        setlaunchClient(new LaunchClient(cosmwasmClient, address, testnetAddrs.launch));
        setcdpClient(new PositionsClient(cosmwasmClient, address, testnetAddrs.positions));
        setliqqueueClient(new LiquidationQueueClient(cosmwasmClient, address, testnetAddrs.liq_queue));
        setstabilitypoolClient(new StabilityPoolClient(cosmwasmClient, address, testnetAddrs.stability_pool));  
        setgovernanceClient(new GovernanceClient(cosmwasmClient, address, testnetAddrs.governance));
        setstakingClient(new StakingClient(cosmwasmClient, address, testnetAddrs.staking));
        setvestingClient(new VestingClient(cosmwasmClient, address, testnetAddrs.vesting));

      }).catch((e) => {
        console.log(e);
      });

    }
  }, [address, status, testnetAddrs]);

  return { 
    cdp_client: cdpClient ?? null,
    launch_client: launchClient ?? null,
    liq_queue_client: liqqueueClient ?? null,
    stability_pool_client: stabilitypoolClient ?? null,
    governance_client: governanceClient ?? null,
    staking_client: stakingClient ?? null,
    vesting_client: vestingClient ?? null,
    base_client: cosmwasmClient ?? null,
    address: address, 
    // connect: connect,
  };
}

export function useQueryClients(): {
  cdpqueryClient: PositionsQueryClient | null,
  oraclequeryClient: OracleQueryClient | null,
  launchqueryClient: LaunchQueryClient | null,
  liqqueuequeryClient: LiquidationQueueQueryClient | null
  stabilitypoolqueryClient: StabilityPoolQueryClient | null;
  governancequeryClient: GovernanceQueryClient | null;
  stakingqueryClient: StakingQueryClient | null;
} {

    var query_errored = true;
    const { getCosmWasmClient } = useChain(chainName);
    ///I can change the RPC node here
    //https://rpc.osmotest5.osmosis.zone/
    //https://g.w.lavanet.xyz:443/gateway/cos3/rpc-http/bb6d2019c50124ec4fdb78498bc50573
    //Reece's: osmosis-rpc.reece.sh
    //Polkachu's: https://osmosis-rpc.polkachu.com/
    //Meta: https://rpc.cosmos.directory/osmosis (list of RPCs: https://cosmos.directory/osmosis/nodes)
    var client = CosmWasmClient.connect("https://g.w.lavanet.xyz:443/gateway/cos3/rpc-http/bb6d2019c50124ec4fdb78498bc50573")
    .catch((e) => {
      console.log(e);
      query_errored = true;
    });

    if (query_errored) {
      client = getCosmWasmClient();
    }
  
    const [positionsQueryClient, setPositionsQueryClient] = useState<PositionsQueryClient | null>( null );
    const [oracleQueryClient, setoracleQueryClient] = useState<OracleQueryClient | null>( null );
    const [launchQueryClient, setLaunchQueryClient] = useState<LaunchQueryClient | null>( null );
    const [liqqueueQueryClient, setliqqueueQueryClient] = useState<LiquidationQueueQueryClient | null>( null );
    const [stabilitypoolqueryClient, setstabilitypoolqueryClient] = useState<StabilityPoolQueryClient | null>( null );
    const [governancequeryClient, setgovernancequeryClient] = useState<GovernanceQueryClient | null>( null );
    const [stakingqueryClient, setstakingqueryClient] = useState<StakingQueryClient | null>( null );

    useEffect(() => { 
      client.then((cosmwasmClient) => {
        if (!cosmwasmClient) {
        console.error('cosmwasmClient undefined or address undefined.');
        return;
        }
        query_errored = false;
        
        //Set clients
        setoracleQueryClient(new OracleQueryClient(cosmwasmClient, testnetAddrs.oracle));
        setLaunchQueryClient(new LaunchQueryClient(cosmwasmClient, testnetAddrs.launch));
        setPositionsQueryClient(new PositionsQueryClient(cosmwasmClient, testnetAddrs.positions));
        setliqqueueQueryClient(new LiquidationQueueQueryClient(cosmwasmClient, testnetAddrs.liq_queue));
        setstabilitypoolqueryClient(new StabilityPoolQueryClient(cosmwasmClient, testnetAddrs.stability_pool));
        setgovernancequeryClient(new GovernanceQueryClient(cosmwasmClient, testnetAddrs.governance));
        setstakingqueryClient(new StakingQueryClient(cosmwasmClient, testnetAddrs.staking));

        }).catch((e) => {
        console.log(e);
      });;
      
    }, [getCosmWasmClient, testnetAddrs]);
  
    return { 
      oraclequeryClient: oracleQueryClient ?? null,
      cdpqueryClient: positionsQueryClient ?? null,
      launchqueryClient: launchQueryClient ?? null,
      liqqueuequeryClient: liqqueueQueryClient ?? null,
      stabilitypoolqueryClient: stabilitypoolqueryClient ?? null,
      governancequeryClient: governancequeryClient ?? null,
      stakingqueryClient: stakingqueryClient ?? null
    };
  }

  