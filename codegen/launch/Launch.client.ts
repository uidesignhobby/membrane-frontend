/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, Uint128, Config, ExecuteMsg, UpdateConfig, InstantiateMsg, LaunchAddrs, AssetInfo, Lockdrop, LockedUser, Lock, QueryMsg, Decimal, UserRatio } from "./Launch.types";
export interface LaunchReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<Config>;
  lockdrop: () => Promise<Lockdrop>;
  contractAddresses: () => Promise<LaunchAddrs>;
  incentiveDistribution: () => Promise<UserRatio[]>;
  userIncentives: ({
    user
  }: {
    user: string;
  }) => Promise<Uint128>;
  userInfo: ({
    user
  }: {
    user: string;
  }) => Promise<LockedUser>;
}
export class LaunchQueryClient implements LaunchReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.lockdrop = this.lockdrop.bind(this);
    this.contractAddresses = this.contractAddresses.bind(this);
    this.incentiveDistribution = this.incentiveDistribution.bind(this);
    this.userIncentives = this.userIncentives.bind(this);
    this.userInfo = this.userInfo.bind(this);
  }

  config = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  lockdrop = async (): Promise<Lockdrop> => {
    return this.client.queryContractSmart(this.contractAddress, {
      lockdrop: {}
    });
  };
  contractAddresses = async (): Promise<LaunchAddrs> => {
    return this.client.queryContractSmart(this.contractAddress, {
      contract_addresses: {}
    });
  };
  incentiveDistribution = async (): Promise<UserRatio[]> => {
    return this.client.queryContractSmart(this.contractAddress, {
      incentive_distribution: {}
    });
  };
  userIncentives = async ({
    user
  }: {
    user: string;
  }): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      user_incentives: {
        user
      }
    });
  };
  userInfo = async ({
    user
  }: {
    user: string;
  }): Promise<LockedUser> => {
    return this.client.queryContractSmart(this.contractAddress, {
      user_info: {
        user
      }
    });
  };
}
export interface LaunchInterface extends LaunchReadOnlyInterface {
  contractAddress: string;
  sender: string;
  lock: ({
    lockUpDuration
  }: {
    lockUpDuration: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  changeLockDuration: ({
    newLockUpDuration,
    oldLockUpDuration,
    uosmoAmount
  }: {
    newLockUpDuration: number;
    oldLockUpDuration: number;
    uosmoAmount?: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdraw: ({
    lockUpDuration,
    withdrawalAmount
  }: {
    lockUpDuration: number;
    withdrawalAmount: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  claim: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  launch: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateConfig: ({
    creditDenom,
    mbrnDenom,
    osmoDenom,
    usdcDenom
  }: {
    creditDenom?: string;
    mbrnDenom?: string;
    osmoDenom?: string;
    usdcDenom?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class LaunchClient extends LaunchQueryClient implements LaunchInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.lock = this.lock.bind(this);
    this.changeLockDuration = this.changeLockDuration.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.claim = this.claim.bind(this);
    this.launch = this.launch.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
  }

  lock = async ({
    lockUpDuration
  }: {
    lockUpDuration: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      lock: {
        lock_up_duration: lockUpDuration
      }
    }, fee, memo, _funds);
  };
  changeLockDuration = async ({
    newLockUpDuration,
    oldLockUpDuration,
    uosmoAmount
  }: {
    newLockUpDuration: number;
    oldLockUpDuration: number;
    uosmoAmount?: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      change_lock_duration: {
        new_lock_up_duration: newLockUpDuration,
        old_lock_up_duration: oldLockUpDuration,
        uosmo_amount: uosmoAmount
      }
    }, fee, memo, _funds);
  };
  withdraw = async ({
    lockUpDuration,
    withdrawalAmount
  }: {
    lockUpDuration: number;
    withdrawalAmount: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw: {
        lock_up_duration: lockUpDuration,
        withdrawal_amount: withdrawalAmount
      }
    }, fee, memo, _funds);
  };
  claim = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      claim: {}
    }, fee, memo, _funds);
  };
  launch = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      launch: {}
    }, fee, memo, _funds);
  };
  updateConfig = async ({
    creditDenom,
    mbrnDenom,
    osmoDenom,
    usdcDenom
  }: {
    creditDenom?: string;
    mbrnDenom?: string;
    osmoDenom?: string;
    usdcDenom?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        credit_denom: creditDenom,
        mbrn_denom: mbrnDenom,
        osmo_denom: osmoDenom,
        usdc_denom: usdcDenom
      }
    }, fee, memo, _funds);
  };
}