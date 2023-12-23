import { useEffect, useState } from "react";
import React from "react";
import { useChain } from '@cosmos-kit/react';
import { chainName } from '../config';

import { Coin, coin, coins } from "@cosmjs/amino";
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import { Asset, Basket, CollateralInterestResponse, InterestResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { denoms, Prices } from ".";
import Popup from "../components/Popup";
import WidgetPopup from "../components/widgetPopup";
import Image from "next/image";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

declare module 'react' {
    export interface InputHTMLAttributes<T> {
      orient?: string;
    }
  }
export interface ContractInfo {
    osmo: number,
    atom: number,
    axlusdc: number,
    usdc: number,
    atomosmo_pool: number,
    osmousdc_pool: number,
    max_LTV: number,
    brw_LTV: number,
    cost: number,
    sliderValue: number,
}
export interface CollateralAssets {
    osmo: number | undefined,
    atom: number | undefined,
    axlusdc: number | undefined,
    usdc: number | undefined,
    atomosmo_pool: number | undefined,
    osmousdc_pool: number | undefined,
}

interface Props {
    cdp_client: PositionsClient | null;
    queryClient: PositionsQueryClient | null;
    address: string | undefined;
    walletCDT: number;
    pricez: Prices;
    rateRes: CollateralInterestResponse | undefined;
    setrateRes: (rateRes: CollateralInterestResponse) => void;
    creditRateRes: InterestResponse | undefined;
    setcreditRateRes: (creditRateRes: InterestResponse) => void;
    basketRes: Basket | undefined;
    setbasketRes: (basketRes: Basket) => void;
    //State
    popupTrigger: boolean;
    setPopupTrigger: (popupTrigger: boolean) => void;
    popupMsg: ReactJSXElement;
    setPopupMsg: (popupMsg: ReactJSXElement) => void;
    popupStatus: string;
    setPopupStatus: (popupStatus: string) => void;
    //Asset specific
        //qty
    osmoQTY: number;
    setosmoQTY: (osmoQTY: number) => void;
    atomQTY: number;
    setatomQTY: (atomQTY: number) => void;
    axlusdcQTY: number;
    setaxlusdcQTY: (axlusdcQTY: number) => void;
    usdcQTY: number;
    setusdcQTY: (usdcQTY: number) => void;
    atomosmo_poolQTY: number;
    setatomosmo_poolQTY: (atomosmo_poolQTY: number) => void;
    osmousdc_poolQTY: number;
    setosmousdc_poolQTY: (osmousdc_poolQTY: number) => void;
    //Positions Visual
    debtAmount: number;
    setdebtAmount: (debtAmount: number) => void;
    maxLTV: number;
    setmaxLTV: (maxLTV: number) => void;
    brwLTV: number;
    setbrwLTV: (brwLTV: number) => void;
    cost: number;
    setCost: (cost: number) => void;
    positionID: string;
    setpositionID: (positionID: string) => void;
    user_address: string;
    setAddress: (user_address: string) => void;
    sliderValue: number;
    setsliderValue: (sliderValue: number) => void;
    creditPrice: number;
    setcreditPrice: (creditPrice: number) => void;
    contractQTYs: ContractInfo;
    setcontractQTYs: (contractQTYs: ContractInfo) => void;
    walletQTYs: CollateralAssets;
}

const Positions = ({cdp_client, queryClient, address, walletCDT, pricez, 
    popupTrigger, setPopupTrigger, popupMsg, setPopupMsg, popupStatus, setPopupStatus,
    rateRes, setrateRes, creditRateRes, basketRes, setcreditRateRes, setbasketRes,
    osmoQTY, setosmoQTY,
    atomQTY, setatomQTY,
    axlusdcQTY, setaxlusdcQTY,
    usdcQTY, setusdcQTY,
    atomosmo_poolQTY, setatomosmo_poolQTY,
    osmousdc_poolQTY, setosmousdc_poolQTY,
    debtAmount, setdebtAmount,
    maxLTV, setmaxLTV,
    brwLTV, setbrwLTV,
    cost, setCost,
    positionID, setpositionID,
    user_address, setAddress,
    sliderValue, setsliderValue,
    creditPrice, setcreditPrice,
    contractQTYs, setcontractQTYs, walletQTYs
}: Props) => {
    //WidgetPopup
    const [widgetpopupTrigger, setWidgetPopupTrigger] = useState(false);
    const [popupWidget, setPopupWidget] = useState<ReactJSXElement>();
    const [widgetpopupStatus, setWidgetPopupStatus] = useState("");

    const { connect } = useChain(chainName);
    //Rates
    const [rates, setRates] = useState<Prices>({
        osmo: 0,
        atom: 0,
        axlUSDC: 0,
        usdc: 0,
        atomosmo_pool: 0,
        osmousdc_pool: 0,
    });
    //Debt Caps
    const [debtCaps, setdebtCaps] = useState<Prices>({
        osmo: 0,
        atom: 0,
        axlUSDC: 0,
        usdc: 0,
        atomosmo_pool: 0,
        osmousdc_pool: 0,
    });
    
    //Redemptions
    const [posClick, setposClick] = useState("mint-button-icon3");
    const [negClick, setnegClick] = useState("mint-button-icon4");
    const [redeemScreen, setredeemScreen] = useState("redemption-screen");
    const [redeemInfoScreen, setredeemInfoScreen] = useState("redemption-screen");
    const [redeemButton, setredeemButton] = useState("user-redemption-button");
    const [redeemability, setRedeemability] = useState<boolean>();
    const [premium, setPremium] = useState<number>(0);
    const [loanUsage, setloanUsage] = useState<string>("");
    const [redemptionRes, setredemptionRes] = useState<RedeemabilityResponse>();
    const [restrictedAssets, setRestricted] = useState({
        sentence: "Click Assets on the left to restrict redemption from, currently restricted: ",
        readable_assets: [] as string[],
        assets: [] as string[],
    });
    //Deposit-Withdraw screen
    const [depositwithdrawScreen, setdepositwithdrawScreen] = useState("deposit-withdraw-screen");
    const [currentfunctionLabel, setcurrentfunctionLabel] = useState("");
    const [currentAsset, setcurrentAsset] = useState("");
    const [assetIntent, setassetIntent] = useState<[string , number][]>([]);
    const [maxLPamount, setmaxLPamount] = useState<bigint>(BigInt(0));
    const [amount, setAmount] = useState<number>(0);
    //Deposit-withdraw Card
    const [OSMOdeposit, setOSMOdeposit] = useState<number | undefined>(undefined);
    const [ATOMdeposit, setATOMdeposit] = useState<number | undefined>(undefined);
    const [axlUSDCdeposit, setaxlUSDCdeposit] = useState<number | undefined>(undefined);
    const [USDCdeposit, setUSDCdeposit] = useState<number | undefined>(undefined);
    const [ATOMOSMO_LPdeposit, setATOMOSMO_LPdeposit] = useState<number | undefined>(undefined);
    const [OSMOaxlUSDC_LPdeposit, setOSMOaxlUSDC_LPdeposit] = useState<number | undefined>(undefined);

    //Squid Widget
    // const [swapScreen, setswapScreen] = useState(false);    
    //Menu
    const [open, setOpen] = useState(false);
    const [menuLabel, setMenuLabel] = useState("Value" as string);

    const [prices, setPrices] = useState<Prices>({
      osmo: 0,
      atom: 0,
      axlUSDC: 0,
      usdc: 0,
      atomosmo_pool: 0,
      osmousdc_pool: 0,
    });

    const handleOpen = () => {
        setOpen(!open);
      };
      const handleMenuOne = () => {
        setOpen(false);
        setMenuLabel("Rate");
      };
      const handleMenuTwo = () => {
        setOpen(false);
        setMenuLabel("Util");
      };
      const handleMenuThree = () => {
        setOpen(false);
        setMenuLabel("Value");
      };

    const handleOSMOqtyClick = async (currentFunction: string) => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("OSMO");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.osmo).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(contractQTYs.osmo))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };
    const handleATOMqtyClick = async (currentFunction: string) => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("ATOM");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.atom).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(contractQTYs.atom))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };
    const handleaxlUSDCqtyClick = async (currentFunction: string) => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("axlUSDC");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.axlUSDC).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(contractQTYs.axlusdc))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };    
    const handleusdcqtyClick = async (currentFunction: string) => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("USDC");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.usdc).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(contractQTYs.usdc))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };    
    const handleatomosmo_poolqtyClick = async (currentFunction: string) => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("ATOM-OSMO LP");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.atomosmo_pool).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000_000_000_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(contractQTYs.atomosmo_pool))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };
    const handleosmousdc_poolqtyClick = async (currentFunction: string) => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("OSMO-axlUSDC LP");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.osmousdc_pool).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000_000_000_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(contractQTYs.osmousdc_pool))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };

   //Redeem
    const handleredeemScreen = () => {
        setredeemScreen("redemption-screen front-screen");
        setredeemInfoScreen("redemption-screen");
        setdepositwithdrawScreen("deposit-withdraw-screen");
        //Set functionality        
        setcurrentfunctionLabel("redemptions");
        //
        //Format popup to inform user that redemptions are unaudited
        setPopupTrigger(true);
        setPopupMsg(<div>Redemptions are unaudited & fully opt-in, so please use at your own risk.</div>);
        setPopupStatus("Warning");
    };
    const handleredeeminfoClick = async () => {

        try {
            console.log("trying")
            await queryClient?.getBasketRedeemability({
                limit: 1,
                positionOwner: user_address,
            }).then((res) => {

            if (res?.premium_infos.length > 0) {
                setredemptionRes(res)
                setredeemScreen("redemption-screen");
                setredeemInfoScreen("redemption-screen front-screen");
                setredeemButton("user-redemption-button")
            } else {
                setredeemButton("user-redemption-button red-border")
            }
            console.log(res)
        })
        } catch (error) {
            setredeemButton("user-redemption-button red-border")
            console.log(error)
        }   

    };
    const handlesetPremium = (event: any) => {
        event.preventDefault();
        setPremium(event.target.value);
      };
    const handlesetloanUsage = (event: any) => {
        event.preventDefault();
        setloanUsage(event.target.value);
    };
    const handleposClick = () => {
        if (posClick == "mint-button-icon3") {
            setposClick("mint-button-icon3-solid");
            setnegClick("mint-button-icon4");
            setRedeemability(true);
        } else {
            setposClick("mint-button-icon3");
            setRedeemability(undefined);
        }
      };

    const handlenegClick = () => {
        if (negClick == "mint-button-icon4") {
            setnegClick("mint-button-icon4-solid");
            setposClick("mint-button-icon3");
            setRedeemability(false);
        } else {
            setnegClick("mint-button-icon4");
            setRedeemability(undefined);
        }
      };
    const handleOSMOClick = () => {
        //Search for OSMO_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.osmo)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "OSMO"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.osmo
                    ]
                }
            })
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.osmo)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "OSMO")
            //Update assets
                        //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
                        //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleATOMClick = () => {
        //Search for ATOM_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.atom)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "ATOM"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.atom
                    ]
                }
            })
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.atom)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "ATOM")
            //Update assets
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleaxlUSDCClick = () => {
        //Search for axlUSDC_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.axlUSDC)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "axlUSDC"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.axlUSDC
                    ]
                }
            })
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.axlUSDC)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "axlUSDC")
            //Update assets
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleusdcClick = () => {
        //Search for axlUSDC_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.usdc)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "USDC"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.usdc
                    ]
                }
            })
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.usdc)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "USDC")
            //Update assets
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleatomosmo_poolClick = () => {
        //Search for atomosmo_pool denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.atomosmo_pool)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "ATOM-OSMO LP"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.atomosmo_pool
                    ]
                }
            })
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.atomosmo_pool)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "ATOM-OSMO LP")
            //Update assets
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleosmousdc_poolClick = () => {
        //Search for osmousdc_pool denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.osmousdc_pool)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "OSMO-axlUSDC LP"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.osmousdc_pool
                    ]
                }
            })
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.osmousdc_pool)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "OSMO-axlUSDC LP")
            //Update assets
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            //@ts-ignore
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handlesetAmountInput = (event: any) => {
        event.preventDefault();
        setAmount(event.target.value);
        if (currentfunctionLabel === "deposit"){
            //Subtract from qty to reset amount to the actual ownership
            // handleQTYsubtraction(currentAsset, amount as number);
            //Add to qty to enable responsive Data/Visuals
            handleQTYaddition(currentAsset, event.target.value - (amount??0) as number);            
        } else if (currentfunctionLabel === "withdraw"){
            if (event.target.value > maxLPamount) {
                setAmount(Number(maxLPamount));
            }
            //Add to qty to reset amount to the actual ownership
            // handleQTYaddition(currentAsset, amount as number);    
            //Subtract from qty to enable responsive Data/Visuals
            handleQTYsubtraction(currentAsset, +(event.target.value) - +(amount as number));
        }
        //Set avg MAX/BRW LTV
        let LTVs = getRataLTV();
        setmaxLTV(LTVs[1]);
        setbrwLTV(LTVs[0]);
        //Set cost
        setCost(getRataCost());

      };
    const handlesetAmount = () => {
        var newAmount = Number(maxLPamount);
        setAmount(newAmount);
        if (currentfunctionLabel === "deposit"){
            //Subtract from qty to reset amount to the actual ownership
            // handleQTYsubtraction(currentAsset, amount as number);
            //Add to qty to enable responsive Data/Visuals
            handleQTYaddition(currentAsset, newAmount - (amount??0) as number);            
        } else if (currentfunctionLabel === "withdraw"){
            if (newAmount > maxLPamount) {
                setAmount(Number(maxLPamount));
            }
            //Add to qty to reset amount to the actual ownership
            // handleQTYaddition(currentAsset, amount as number);    
            //Subtract from qty to enable responsive Data/Visuals
            handleQTYsubtraction(currentAsset, +(newAmount) - +(amount as number));
        }
    };
    //Reset position data to its contract based values
    const resettoContractPosition = () => {
        setosmoQTY(contractQTYs.osmo);
        setatomQTY(contractQTYs.atom);
        setaxlusdcQTY(contractQTYs.axlusdc);
        setatomosmo_poolQTY(contractQTYs.atomosmo_pool);
        setosmousdc_poolQTY(contractQTYs.osmousdc_pool);
        setmaxLTV(contractQTYs.max_LTV);
        setbrwLTV(contractQTYs.brw_LTV);
        setCost(contractQTYs.cost);
        setsliderValue(contractQTYs.sliderValue);
    }
    //Deposit-Withdraw screen    
    const handledepositClick = async () => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setcurrentfunctionLabel("deposit");
        //clear intents
        setassetIntent([]);
        switch (currentAsset) {
            case "OSMO": {
                handleOSMOqtyClick("deposit")
                break;
            }
            case "ATOM": {
                handleATOMqtyClick("deposit")
                break;
            }
            case "axlUSDC": {
                handleaxlUSDCqtyClick("deposit")
                break;
            }
            case "USDC": {
                handleusdcqtyClick("deposit")
                break;
            }
            case "ATOM-OSMO LP": {
                handleatomosmo_poolqtyClick("deposit")
                break;
            }
            case "OSMO-axlUSDC LP": {
                handleosmousdc_poolqtyClick("deposit")
                break;
            }
        }
    };
    const handlewithdrawClick = async () => {
        //Reset Amount
        setAmount(0);
        //Reset QTYs
        resettoContractPosition();
        //Set functionality
        setcurrentfunctionLabel("withdraw");
        //clear intents
        setassetIntent([]);
        switch (currentAsset) {
            case "OSMO": {
                handleOSMOqtyClick("withdraw")
                break;
            }
            case "ATOM": {
                handleATOMqtyClick("withdraw")
                break;
            }
            case "axlUSDC": {
                handleaxlUSDCqtyClick("withdraw")
                break;
            }
            case "USDC": {
                handleusdcqtyClick("withdraw")
                break;
            }
            case "ATOM-OSMO LP": {
                handleatomosmo_poolqtyClick("withdraw")
                break;
            }
            case "OSMO-axlUSDC LP": {
                handleosmousdc_poolqtyClick("withdraw");
                break;
            }
        }
    };
    //Logo functionality activation
    const handleQTYaddition = (current_asset: string, amount: number) => {

        switch(current_asset) {
            case 'OSMO': {
                var new_qty = Math.max(+osmoQTY + +amount, 0);
                setosmoQTY(new_qty);

                break;
            }
            case 'ATOM':{
                var new_qty =  Math.max(+atomQTY + +amount, 0);
                setatomQTY(new_qty);
                
                break;
            }
            case 'axlUSDC':{
                var new_qty =  Math.max(+axlusdcQTY + +amount, 0);
                setaxlusdcQTY(new_qty);

                break;
            }
            case 'USDC':{
                var new_qty =  Math.max(+usdcQTY + +amount, 0);
                setusdcQTY(new_qty);

                break;
            }
            case 'atomosmo_pool':{
                var new_qty =  Math.max(+atomosmo_poolQTY + +amount, 0);
                setatomosmo_poolQTY(new_qty);

                break;
            }
            case 'osmousdc_pool':{
                var new_qty =  Math.max(+osmousdc_poolQTY + +amount, 0);
                setosmousdc_poolQTY(new_qty);

                break;
            }
          }
    };
    const handleQTYsubtraction = (current_asset: string, amount: number) => {

        switch(current_asset) {
            case 'OSMO': {
                var new_qty = Math.max(+osmoQTY - +amount, 0);
                setosmoQTY(new_qty);

                //Set to 0 if below
                if (new_qty <= 0){
                    setosmoQTY(0);
                    new_qty = 0;
                }
                break;
            }
            case 'ATOM':{
                var new_qty = Math.max(+atomQTY - +amount, 0);
                setatomQTY(new_qty);

                //Set to 0 if below
                if (new_qty <= 0){
                    setatomQTY(0);
                    new_qty = 0;
                }
                break;
            }
            case 'axlUSDC':{
                var new_qty = Math.max(+axlusdcQTY - +amount, 0);
                setaxlusdcQTY(new_qty);

                //Set to 0 if below
                if (new_qty <= 0){
                    setaxlusdcQTY(0);
                    new_qty = 0;
                }
                break;
            }
            case 'USDC':{
                var new_qty = Math.max(+usdcQTY - +amount, 0);
                setusdcQTY(new_qty);

                //Set to 0 if below
                if (new_qty <= 0){
                    setusdcQTY(0);
                    new_qty = 0;
                }
                break;
            }
            case 'atomosmo_pool':{
                var new_qty = Math.max(+atomosmo_poolQTY - +amount, 0);
                setatomosmo_poolQTY(new_qty);

                //Set to 0 if below
                if (new_qty <= 0){
                    setatomosmo_poolQTY(0);
                    new_qty = 0;
                }
                break;
            }
            case 'osmousdc_pool':{
                var new_qty = Math.max(+osmousdc_poolQTY - +amount, 0);
                setosmousdc_poolQTY(new_qty);

                //Set to 0 if below
                if (new_qty <= 0){
                    setosmousdc_poolQTY(0);
                    new_qty = 0;
                }
                break;
            }
          }
    };
    const handlecontractQTYupdate = () => {        
        //Set new LTVs & costs
        let LTVs = getRataLTV();
        let cost = getRataCost();
        //@ts-ignore
        setcontractQTYs(prevState => {
            return { 
                ...prevState,
                max_LTV: LTVs[1],
                brw_LTV: LTVs[0],
                cost: cost
            }
        })
        //Set QTYs
        switch (currentAsset) {
            case "OSMO": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmo: +prevState.osmo + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmo: +prevState.osmo - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "ATOM": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atom: +prevState.atom + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atom: +prevState.atom - +(amount??0),
                        }
                    })
                }
                
                break;
            }
            case "axlUSDC": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            axlusdc: +prevState.axlusdc + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            axlusdc: +prevState.axlusdc - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "USDC": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdc: +prevState.usdc + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdc: +prevState.usdc - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "ATOM-OSMO LP": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atomosmo_pool: +prevState.atomosmo_pool + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atomosmo_pool: +prevState.atomosmo_pool - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "OSMO-axlUSDC LP": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmousdc_pool: +prevState.osmousdc_pool + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmousdc_pool: +prevState.osmousdc_pool - +(amount??0),
                        }
                    })
                }
                break;
            }
        }
    }
    const handleExecution = async () => {
        //Check if wallet is connected & connect if not
        if (address === undefined) {
            connect();
            return;
        }
        //create a variable for asset_intents so we can mutate it within the function
        //duplicate intents dont work
        var asset_intent = assetIntent;
        //switch on functionality
        switch (currentfunctionLabel){
            case "deposit":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount ?? 0]];
                }
                ///parse assets into coin amounts
                var user_coins = getcoinsfromassetIntents(asset_intent);

                try {
                    ////Execute Deposit////
                    await cdp_client?.deposit({
                        positionId: (positionID === "0" ? undefined : positionID),
                        positionOwner: user_address,
                    },
                    "auto", undefined, user_coins).then(async (res) => {
                        console.log(res?.events.toString())
                        //format pop up
                        setPopupTrigger(true);
                        //map asset intents to readable string
                        var readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        setPopupMsg(<div>Deposit of {readable_asset_intent} successful</div>);
                        setPopupStatus("Success");   
                        //Update contract QTYs
                        handlecontractQTYupdate();
                    });
                    //

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(<div>{e.message}</div>);
                    setPopupStatus("Deposit Error");
                }
               break;
            }
            case "withdraw":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount ?? 0]];
                }                
                ///parse assets into coin amounts
                var assets = getassetsfromassetIntents(asset_intent);
                
                try {
                    ////Execute Withdraw////
                    await cdp_client?.withdraw({
                        assets: assets,
                        positionId: positionID,
                    },
                    "auto").then((res) => {       
                        console.log(res?.events.toString())   
                        //map asset intents to readable string
                        let readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Withdrawal of {readable_asset_intent} successful</div>);
                        setPopupStatus("Success");       
                        //Update contract QTYs
                        handlecontractQTYupdate();   
                    })

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(<div>{e.message}</div>);
                    setPopupStatus("Withdrawal Error");
                } 
                break;
            }
            case "mint": {                
                try {
                    ///Execute the Mint
                    await cdp_client?.increaseDebt({
                        positionId: positionID,
                        amount: ((amount ?? 0) * 1_000_000).toString(),
                    }, "auto", undefined).then((res) => {           
                        console.log(res?.events.toString())             
                        //Update mint amount
                        setdebtAmount(+debtAmount + +((amount ?? 0) * 1_000_000));
                        setsliderValue((+debtAmount + +((amount ?? 0) * 1_000_000))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Mint of {(amount ?? 0)} CDT into your wallet successful. Be aware that now that you have minted, you cannot withdraw collateral that would push your LTV past the yellow line & you will be liquidated down to said line if you reach the red. Also, you cannot pay below minimum debt so if you have minted at the minimum you will need to repay in full + interest.</div>);
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(<div>{e.message}</div>);
                    setPopupStatus("Mint Error");
                }
                
                break;
            } 
            case "repay": {
                //if trying to full repay, because sending back excess debt doesn't work...
                //repay needs to accrue & then query new debt amount and then repay
                if (((amount ?? 0)* 1_000_000) >= debtAmount) {
                    //execute an accrue msg first
                    try {
                        ///Execute the Accrue
                        await cdp_client?.accrue({
                            positionIds: [positionID],
                            positionOwner: user_address,
                        }, "auto", undefined).then(async (res) => {           
                            console.log(res?.events.toString())
                            //Query position
                            //getPosition
                            await queryClient?.getBasketPositions(
                                {
                                    user: address as string,
                                }
                            ).then(async (res) => {
                                //Set amount to new debt amount
                                var repay_amount = parseInt(res[0].positions[0].credit_amount);
                                //Execute the Repay
                                try {
                                    ///Execute the Repay
                                    await cdp_client?.repay({
                                        positionId: positionID,
                                    }, "auto", undefined, coins(repay_amount, denoms.cdt)).then((res) => {           
                                        console.log(res?.events.toString())
                                        //Update mint amount
                                        setdebtAmount(+debtAmount - +(repay_amount* 1_000_000));
                                        setsliderValue((+debtAmount - +(repay_amount* 1_000_000))/1000000);
                                        //format pop up
                                        setPopupTrigger(true);
                                        setPopupMsg(<div>Repayment of {repay_amount} CDT successful</div>);
                                        setPopupStatus("Success");
                                    })
                                    
                                } catch (error){
                                    ////Error message
                                    const e = error as { message: string }
                                    console.log(e.message)
                                    ///Format Pop up
                                    setPopupTrigger(true);
                                    setPopupMsg(<div>{e.message}</div>);
                                    setPopupStatus("Repay Error");
                                }
                            })
                        })
                        
                    } catch (error){
                        ////Error message
                        const e = error as { message: string }
                        console.log(e.message)
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Accrue Error");
                    }
                } else {
                    try {
                        var res = await cdp_client?.repay({
                            positionId: positionID,
                        }, "auto", undefined, coins(Math.ceil(((amount??0) * 1_000_000)), denoms.cdt))
                        .then((res) => {           
                            console.log(res?.events.toString())
                            //Update mint amount
                            setdebtAmount(+debtAmount - +((amount ?? 0)* 1_000_000));
                            setsliderValue((+debtAmount - +((amount ?? 0)* 1_000_000))/1000000);
                            //format pop up
                            setPopupTrigger(true);
                            setPopupMsg(<div>Repayment of {(amount ?? 0)} CDT successful</div>);
                            setPopupStatus("Success");
                        })
                        
                    } catch (error){
                        ////Error message
                        const e = error as { message: string }
                        console.log(e.message)
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Repay Error");
                    }
                }
                break;
            }
            case "redemptions": {
                try {                    
                    ///Execute the contract
                    await cdp_client?.editRedeemability(
                    {
                        positionIds: [positionID],
                        maxLoanRepayment: loanUsage ?? undefined,
                        premium: premium ?? undefined,
                        redeemable: redeemability ?? undefined,
                        restrictedCollateralAssets: restrictedAssets.assets ?? undefined,
                    }, "auto", undefined).then(async (res) => {
                        console.log(res?.events.toString())
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Redemption settings updated successfully</div>);
                        setPopupStatus("Success");
                    })

                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(<div>{e.message}</div>);
                    setPopupStatus("Edit Redemption Info Error");
                }
            }
        }

    };
    //we add decimals to the asset amounts
    const getcoinsfromassetIntents = (intents: [string, number][]) => {
        var workingIntents: Coin[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.osmo))
                    break;
                }
                case "ATOM": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.atom))
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.axlUSDC))
                    break;
                }                
                case "USDC": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.usdc))
                    break;
                }
                case "ATOM-OSMO LP": { 
                    workingIntents.push(coin((BigInt(intent[1]) * 1_000_000_000_000_000_000n).toString(), denoms.atomosmo_pool))
                    break;
                }
                case "OSMO-axlUSDC LP": {
                    workingIntents.push(coin((BigInt(intent[1]) * 1_000_000_000_000_000_000n).toString(), denoms.osmousdc_pool))
                    break;
                }
            }
        })
        return workingIntents
    };
    const getassetsfromassetIntents = (intents: [string, number][]) => {
        var workingIntents: Asset[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.osmo,
                        }}
                    })
                    break;
                }
                case "ATOM": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.atom,
                        }}
                    })
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.axlUSDC,
                        }}
                    })
                    break;
                }
                case "USDC": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.usdc,
                        }}
                    })
                    break;
                }
                case "ATOM-OSMO LP": { //18 decimal instead of 6
                    workingIntents.push({
                        amount: (BigInt(intent[1]) * 1_000_000_000_000_000_000n).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.atomosmo_pool,
                        }}
                    })
                    break;
                }
                case "OSMO-axlUSDC LP": { //18 decimal instead of 6
                    workingIntents.push({
                        amount: (BigInt(intent[1]) * 1_000_000_000_000_000_000n).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.osmousdc_pool,
                        }}
                    })
                    break;
                }
            }
        })
        return workingIntents
    };
      
   const onTFMTextClick = () => {
        window.open(
        "https://tfm.com/ibc"
        );
   };  
//    const handleswapClick = () => {
//     //Set popup for squid widget
//     setWidgetPopupTrigger(true);
//     setPopupWidget(<div>
//         <SquidWidget config={
//         {integratorId: "membrane-swap-widget",
//         companyName:"Membrane",
//         slippage:3,
//         hideAnimations: true,
//         showOnRampLink: true,
//         initialToChainId: "osmosis-1",
//         initialFromChainId: "cosmoshub-4",
//         }}/>
//     </div>);
//     setWidgetPopupStatus("Swap to Osmosis");
//         // setswapScreen(true);
//    };

   function getTVL() {
    return(
        (osmoQTY * +prices.osmo) + (atomQTY * +prices.atom) + (axlusdcQTY * +prices.axlUSDC) + (usdcQTY * +prices.usdc)
        + (atomosmo_poolQTY * +prices.atomosmo_pool) + (osmousdc_poolQTY * +prices.osmousdc_pool)
    )
   }
   function getassetRatios() {
    var TVL = getTVL();
    return(
        {
            osmo: (osmoQTY * +prices.osmo) / TVL,
            atom: (atomQTY * +prices.atom) / TVL,
            axlusdc: (axlusdcQTY * +prices.axlUSDC) /TVL,
            usdc: (usdcQTY * +prices.usdc) /TVL,
            atomosmo_pool: (atomosmo_poolQTY * +prices.atomosmo_pool) /TVL,
            osmousdc_pool: (osmousdc_poolQTY * +prices.osmousdc_pool) /TVL,
        }
    )
   }
   /// Get pro-rata LTV
   function getRataLTV() {
    var ratios = getassetRatios();
    var maxLTV = 0;
    var brwLTV = 0;
    
    basketRes?.collateral_types.forEach((collateral) => {      
        //@ts-ignore
        if (collateral.asset.info.native_token.denom === denoms.osmo){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.osmo;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.osmo;  
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.atom){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.atom;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.atom;   
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.axlUSDC){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.axlusdc;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.axlusdc;  
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.usdc){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.usdc;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.usdc;     
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.atomosmo_pool){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.atomosmo_pool;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.atomosmo_pool;  
        //@ts-ignore           
        } else if (collateral.asset.info.native_token.denom === denoms.osmousdc_pool){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.osmousdc_pool;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.osmousdc_pool;  
        }
    });

    return( [brwLTV, maxLTV] )
   }
   ///Get pro-rata cost
    function getRataCost() {
        var ratios = getassetRatios();
        var cost = 0;

        if (osmoQTY > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.osmo
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.osmo).toFixed(4));
            }
        }
        if (atomQTY > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.atom
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.atom).toFixed(4));
            }
        }
        if (axlusdcQTY > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.axlUSDC
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.axlusdc).toFixed(4));
            }
        }
        if (usdcQTY > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.usdc
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.usdc).toFixed(4));
            }
        }
        if (atomosmo_poolQTY > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.atomosmo_pool
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.atomosmo_pool).toFixed(4));
            }
        }
        if (osmousdc_poolQTY > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.osmousdc_pool
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.osmousdc_pool).toFixed(4));
            }
        }

        //Now add credit redemption rate to the cost
        if (creditRateRes){
            //Add credit rate to cost
            if (creditRateRes.negative_rate && basketRes?.negative_rates){
                cost -= parseFloat(creditRateRes.credit_interest);
            } else {
                cost += parseFloat(creditRateRes.credit_interest);
            }   
        }

        return(cost)
    }
    function getRates() {
        var rates = {
            osmo: 0,
            atom: 0,
            axlUSDC: 0,
            usdc: 0,
            atomosmo_pool: 0,
            osmousdc_pool: 0,
        };
        //find OSMO's index in the basket                
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.osmo
        })

        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.osmo = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }

        //find ATOM's index in the basket                
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.atom
        })
        if (rate_index !== undefined){
        //use the index to get its interest rate
            rates.atom = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }

        //find AXLUSDC's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.axlUSDC
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.axlUSDC = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        
        //find USDC's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.usdc
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.usdc = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }

        //find ATOMOSMO's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.atomosmo_pool
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.atomosmo_pool = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }

        //find OSMOUSDC's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.osmousdc_pool
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.osmousdc_pool = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        
        setRates(rates)
    }
    async function getassetdebtUtil() {
        try {
            var debtcaps = {
                osmo: 0,
                atom: 0,
                axlUSDC: 0,
                usdc: 0,
                atomosmo_pool: 0,
                osmousdc_pool: 0,
            };
            await queryClient?.getBasketDebtCaps().then((res) => {
                ///Find the debt cap util for each collateral denom
                res.forEach((debtCap) => {
                    //@ts-ignore
                    if (debtCap.collateral.native_token.denom === denoms.osmo){
                        debtcaps.osmo = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.atom){
                        debtcaps.atom = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.axlUSDC){
                        debtcaps.axlUSDC = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.usdc){
                        debtcaps.usdc = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.atomosmo_pool){
                        debtcaps.atomosmo_pool = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.osmousdc_pool){
                        debtcaps.osmousdc_pool = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                    }

                })
                setdebtCaps(debtcaps);
            })

        } catch (error) {
            ////Error message
            const e = error as { message: string }
            console.log(e.message)
        }
    }

    function showDefault() {
        return false
    }
    function handlesetDepositAmount(setFn: (amount: number) => void, deposit_amount: number) {
        setFn(deposit_amount)
    }
    function handlesetDepositInput(setFn: (amount: number) => void, event: any){
        event.preventDefault();
        setFn(event.target.value);        
    }
    function checkIfWalletEmpty() {
        if (address !== undefined) {
            //check if wallet is empty
            if ((walletQTYs.osmo??0) === 0 && (walletQTYs.atom??0) === 0 && (walletQTYs.axlusdc??0) === 0 && (walletQTYs.usdc??0) === 0 && (walletQTYs.atomosmo_pool??0) === 0 && (walletQTYs.osmousdc_pool??0) === 0){
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    function createDepositElements(){
        console.log(walletQTYs)
        return(<>
            {(walletQTYs.osmo??0) > 0 ?        
            <div className="deposit-element">
                <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/osmo.svg" />
                </div>
                <form className="deposit-form">
                    <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount(setOSMOdeposit, (walletQTYs.osmo??0))}>max: {(walletQTYs.osmo??0).toFixed(3)}</div>
                    <label className="deposit-amount-label">OSMO amount:</label>     
                    <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={OSMOdeposit ?? ''} type="number" onChange={(event)=>handlesetDepositInput(setOSMOdeposit, event)}/>
                </form>
            </div>: null}
            {walletQTYs.atom != undefined && (walletQTYs.atom??0) > 0 ?        
            <div className="deposit-element">
                <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/atom.svg" />
                </div>
                <form className="deposit-form">
                    <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount(setATOMdeposit, walletQTYs.atom??0)}>max: {(walletQTYs.atom??0).toFixed(3)}</div>
                    <label className="deposit-amount-label">ATOM amount:</label>     
                    <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={ATOMdeposit ?? ''} type="number" onChange={(event)=>handlesetDepositInput(setATOMdeposit, event)}/>
                </form>
            </div>: null}
            {walletQTYs.usdc != undefined && (walletQTYs.usdc??0) > 0 ?        
            <div className="deposit-element">
                <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.svg" />
                </div>
                <form className="deposit-form">
                    <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount(setUSDCdeposit, walletQTYs.usdc??0)}>max: {(walletQTYs.usdc??0).toFixed(3)}</div>
                    <label className="deposit-amount-label">USDC amount:</label>     
                    <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={USDCdeposit ?? ''} type="number" onChange={(event)=>handlesetDepositInput(setUSDCdeposit, event)}/>
                </form>
            </div>: null}
            {walletQTYs.axlusdc != undefined && (walletQTYs.axlusdc??0) > 0 ?        
            <div className="deposit-element">
                <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                </div>
                <form className="deposit-form">
                    <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount(setaxlUSDCdeposit, walletQTYs.axlusdc??0)}>max: {(walletQTYs.axlusdc??0).toFixed(3)}</div>
                    <label className="deposit-amount-label">axlUSDC amount:</label>     
                    <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={axlUSDCdeposit ?? ''} type="number" onChange={(event)=>handlesetDepositInput(setaxlUSDCdeposit, event)}/>
                </form>
            </div>: null}
            {walletQTYs.atomosmo_pool != undefined && (walletQTYs.atomosmo_pool??0) > 0 ?        
            <div className="deposit-element">
                <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/atom.svg" />
                </div>
                <form className="deposit-form">
                    <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount(setATOMOSMO_LPdeposit, walletQTYs.atomosmo_pool??0)}>max: {(walletQTYs.atomosmo_pool??0).toFixed(3)}</div>
                    <label className="deposit-amount-label">ATOM/OSMO LP amount:</label>     
                    <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={ATOMOSMO_LPdeposit ?? ''} type="number" onChange={(event)=>handlesetDepositInput(setATOMOSMO_LPdeposit, event)}/>
                </form>
            </div>: null}
            {walletQTYs.osmousdc_pool != undefined && (walletQTYs.osmousdc_pool??0) > 0 ?        
            <div className="deposit-element">
                <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/osmo.svg" />
                </div>
                <form className="deposit-form">
                    <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount(setOSMOaxlUSDC_LPdeposit, walletQTYs.osmousdc_pool??0)}>max: {(walletQTYs.osmousdc_pool??0).toFixed(3)}</div>
                    <label className="deposit-amount-label">OSMO/axlUSDC LP amount:</label>     
                    <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={OSMOaxlUSDC_LPdeposit ?? ''} type="number" onChange={(event)=>handlesetDepositInput(setOSMOaxlUSDC_LPdeposit, event)}/>
                </form>
            </div>: null}
        </>);
    }
    
    const onSquidClick = () => {
        window.open(
        "https://app.squidrouter.com/"
        );
    };
    const onIBCClick = () => {
        window.open(
        "https://ibc.fun/"
        );
    };
    const onCCTPClick = () => {
        window.open(
        "https://cctp.money/"
        );
    };
    const handleonboardingDeposit = async () => {
        ///Set asset intents
        var asset_intent: [string, number][] = [];
        if (OSMOdeposit != undefined && OSMOdeposit > 0){
            asset_intent.push(["OSMO", OSMOdeposit])
        }
        if (ATOMdeposit != undefined && ATOMdeposit > 0){
            asset_intent.push(["ATOM", ATOMdeposit])
        }
        if (USDCdeposit != undefined && USDCdeposit > 0){
            asset_intent.push(["USDC", USDCdeposit])
        }
        if (axlUSDCdeposit != undefined && axlUSDCdeposit > 0){
            asset_intent.push(["axlUSDC", axlUSDCdeposit])
        }
        if (ATOMOSMO_LPdeposit != undefined && ATOMOSMO_LPdeposit > 0){
            asset_intent.push(["ATOM-OSMO LP", ATOMOSMO_LPdeposit])
        }
        if (OSMOaxlUSDC_LPdeposit != undefined && OSMOaxlUSDC_LPdeposit > 0){
            asset_intent.push(["OSMO-axlUSDC LP", OSMOaxlUSDC_LPdeposit])
        }
        var user_coins = getcoinsfromassetIntents(asset_intent);     

        try {
            cdp_client?.deposit({
                positionId: undefined,
                positionOwner: address as string,
            }, "auto", undefined, user_coins).then((res) => {           
                console.log(res?.events.toString())
                //Update mint amount
                setOSMOdeposit(undefined);
                setATOMdeposit(undefined);
                setUSDCdeposit(undefined);
                setaxlUSDCdeposit(undefined);
                setATOMOSMO_LPdeposit(undefined);
                setOSMOaxlUSDC_LPdeposit(undefined);
                //format pop up
                setPopupTrigger(true);
                //map asset intents to readable string
                var readable_asset_intent = asset_intent.map((asset) => {
                    return asset[1] + " " + asset[0]
                })
                setPopupMsg(<div>Deposit of {readable_asset_intent} successful</div>);
                setPopupStatus("Success");
                
                //Clear intents
                setassetIntent([])
            })
        } catch (error) {            
            ////Error message
            const e = error as { message: string }
            console.log(e.message)
            ///Format Pop up
            setPopupTrigger(true);
            setPopupMsg(<div>{e.message}</div>);
            setPopupStatus("Deposit Error");
        }
    };

    //getuserPosition info && set State
    useEffect(() => {    
        if (address) {
            //setAddress
            setAddress(address as string)
        }
        if (prices.osmo === 0 ){ setPrices(pricez) }
        setrateRes(rateRes as CollateralInterestResponse);
        getRates();
        setcreditRateRes(creditRateRes as InterestResponse)
        setbasketRes(basketRes as Basket)
        getassetdebtUtil();
        resettoContractPosition();

    }, [pricez, address, rateRes, creditRateRes, basketRes])
    

  return (
    <div className="page-frame positions">
        <div className="first-vault-component">
            {showDefault() ? <div className="vaults-title">
                VAULTS
                <Image className="pie-chart-icon1" width={48} height={48} alt="" src="images/pie_chart.svg" />          
            </div>
                : 
            checkIfWalletEmpty() === true ?             
            <div className="onboarding-deposit-title" style={{left: "0%"}}>
                Bridge to Osmosis     
            </div> 
            :
            <div className="onboarding-deposit-title" style={{left: "3%"}}>
                Fund Position
                <Image className="pie-chart-icon1" width={48} height={48} alt="" src="images/pie_chart.svg" />          
            </div> 
            }
            {showDefault() ? <div className="asset-info">
                <div className="infobox-icon3"/>
                <div className="asset-info-child" />
                <div className="asset-info-item" />
                <div className="asset-info-inner" />
                <div className="line-div" />
                <div className="asset-info-child1" />
                <div className="asset-info-child2" />
                <div className="asset-info-child3" />
                <div className="assetinfo-data">
                    <div className="assetinfo-assets">
                        <div className="asset">Asset</div>
                        <Image className={osmoQTY > 0 ? "osmo-logo-icon" : "low-opacity osmo-logo-icon" } width={45} height={45} alt="" src="images/osmo.svg" onClick={handleOSMOClick}/>
                        <Image className={atomQTY > 0 ? "atom-logo-icon" : "low-opacity atom-logo-icon"} width={45} height={45} alt="" src="images/atom.svg" onClick={handleATOMClick} />
                        <Image className={axlusdcQTY > 0 ? "axlusdc-logo-icon" : "low-opacity axlusdc-logo-icon"} width={45} height={45} alt="" src="images/usdc.axl.svg" onClick={handleaxlUSDCClick} />
                        <Image className={usdcQTY > 0 ? "axlusdc-logo-icon" : "low-opacity axlusdc-logo-icon"} width={45} height={45} alt="" src="images/usdc.svg" onClick={handleusdcClick} />
                    </div >
                    <div className="assetinfo-qty">
                        <div className="qty">Quantity</div>
                        <div className={"osmo-qty"} onClick={()=>handleOSMOqtyClick(currentfunctionLabel)}>{osmoQTY === 0 ? "Add" : osmoQTY > 1000 ? ((osmoQTY/1000) ?? 0).toFixed(2)+"k" : osmoQTY}</div>
                        <div className={"atom-qty"} onClick={()=>handleATOMqtyClick(currentfunctionLabel)}>{atomQTY === 0 ? "Add" : atomQTY > 1000 ? ((atomQTY/1000) ?? 0).toFixed(2)+"k" : atomQTY}</div>
                        <div className={"axlUSDC-qty"} onClick={()=>handleaxlUSDCqtyClick(currentfunctionLabel)}>{axlusdcQTY === 0 ? "Add" : axlusdcQTY > 1000 ? ((axlusdcQTY/1000) ?? 0).toFixed(2)+"k" : axlusdcQTY}</div>
                        <div className={"axlUSDC-qty"} onClick={()=>handleusdcqtyClick(currentfunctionLabel)}>{usdcQTY === 0 ? "Add" : usdcQTY > 1000 ? ((usdcQTY/1000) ?? 0).toFixed(2)+"k" : usdcQTY}</div>
                    </div>
                    <div className="assetinfo-menuitem">
                        <div className="value value-menu-dropdown" onClick={handleOpen}>
                            <button onClick={handleOpen} style={{outline: "none"}}>{menuLabel}</button>
                            {open ? (
                                <ul className="value-menu">
                                {menuLabel !== "Rate" ? (<li className="value-menu-item" onClick={handleMenuOne}>
                                    <button onClick={handleMenuOne} style={{outline: "none"}}>Rate</button>
                                </li>) : null}
                                {menuLabel !== "Util" ? (<li className="value-menu-item" onClick={handleMenuTwo}>
                                    <button onClick={handleMenuTwo} style={{outline: "none"}}>Util</button>
                                </li>) : null}
                                {menuLabel !== "Value" ? (<li className="value-menu-item" onClick={handleMenuThree}>
                                    <button onClick={handleMenuThree} style={{outline: "none"}}>Value</button>
                                </li>) : null}
                                </ul>
                            ) : null}
                        </div>
                        {menuLabel === "Value" ? 
                            <>
                            <div className={osmoQTY > 0 ?  "" : "low-opacity"}>${ (osmoQTY * +prices.osmo) > 1000 ? (((osmoQTY * +prices.osmo)/1000) ?? 0).toFixed(2)+"k" : ((osmoQTY * +prices.osmo) ?? 0).toFixed(2)}</div>
                            <div className={atomQTY > 0 ?  "" : "low-opacity"}>${ (atomQTY * +prices.atom) > 1000 ? (((atomQTY * +prices.atom)/1000) ?? 0).toFixed(2)+"k" : ((atomQTY * +prices.atom) ?? 0).toFixed(2)}</div> 
                            <div className={axlusdcQTY > 0 ?  "" : "low-opacity"}>${ (axlusdcQTY * +prices.axlUSDC) > 1000 ? (((axlusdcQTY * +prices.axlUSDC)/1000) ?? 0).toFixed(2)+"k" : ((axlusdcQTY * +prices.axlUSDC) ?? 0).toFixed(2)}</div> 
                            <div className={usdcQTY > 0 ?  "" : "low-opacity"}>${ (usdcQTY * +prices.usdc) > 1000 ? (((usdcQTY * +prices.usdc)/1000) ?? 0).toFixed(2)+"k" : ((usdcQTY * +prices.usdc) ?? 0).toFixed(2)}</div> 
                            </>
                        : menuLabel === "Rate" ? 
                            <>
                            <div className={osmoQTY > 0 ?  "" : "low-opacity"}>{rates.osmo.toFixed(4)}%</div>
                            <div className={atomQTY > 0 ?  "" : "low-opacity"}>{(rates.atom).toFixed(4)}%</div>
                            <div className={axlusdcQTY > 0 ?  "" : "low-opacity"}>{(rates.axlUSDC).toFixed(4)}%</div>
                            <div className={usdcQTY > 0 ?  "" : "low-opacity"}>{(rates.usdc).toFixed(4)}%</div>
                            </>
                        : menuLabel === "Util" ? 
                            <>
                            <div className={osmoQTY > 0 ?  "" : "low-opacity"}>{(debtCaps.osmo * 100).toFixed(2)}%</div>
                            <div className={atomQTY > 0 ?  "" : "low-opacity"}>{(debtCaps.atom * 100).toFixed(2)}%</div>
                            <div className={axlusdcQTY > 0 ?  "" : "low-opacity"}>{(debtCaps.axlUSDC * 100).toFixed(2)}%</div>
                            <div className={usdcQTY > 0 ?  "" : "low-opacity"}>{(debtCaps.usdc * 100).toFixed(2)}%</div>
                            </>
                        : null}
                    </div>
                </div>
                <div className="tvl-500">TVL: ${(getTVL() ?? 0).toFixed(2)}</div>
                
                <div style={{opacity:0}}>
                    <Image className={atomosmo_poolQTY > 0 ?" atomosmopool-atom-icon" : "low-opacity atomosmopool-osmo-icon"} width={45} height={45} alt="" src="images/atom.svg"  onClick={(handleatomosmo_poolClick)}/>
                    <Image className={atomosmo_poolQTY > 0 ?" atomosmopool-osmo-icon" : "low-opacity atomosmopool-osmo-icon"} width={45} height={45} alt="" src="images/osmo.svg"  onClick={(handleatomosmo_poolClick)}/>
                    {/* <div className={"atomosmopool-qty"} onClick={()=>handleatomosmo_poolqtyClick(currentfunctionLabel)}>{getReadableLPQTY(atomosmo_poolQTY)}</div> */}
                    <div className={atomosmo_poolQTY > 0 ?  "cdp-div11" : "low-opacity cdp-div11"}>${((atomosmo_poolQTY * +prices.atomosmo_pool) ?? 0).toFixed(2)}</div>
                </div>
                <div style={{opacity:0}}>
                    <Image className={osmousdc_poolQTY > 0 ? " osmousdcpool-osmo-icon": "low-opacity osmousdcpool-osmo-icon"} width={45} height={45} alt="" src="images/osmo.svg"  onClick={(handleosmousdc_poolClick)}/>
                    <Image className={osmousdc_poolQTY > 0 ? " osmousdcpool-usdc-icon": "low-opacity osmousdcpool-osmo-icon"} width={45} height={45} alt="" src="images/usdc.axl.svg"  onClick={(handleosmousdc_poolClick)}/>
                    {/* <div className={"osmousdcpool-qty"} onClick={()=>handleosmousdc_poolqtyClick(currentfunctionLabel)}>{getReadableLPQTY(osmousdc_poolQTY)}</div> */}
                    <div className={osmousdc_poolQTY > 0 ?  "cdp-div13" : "low-opacity cdp-div13"}>${((osmousdc_poolQTY * +prices.osmousdc_pool) ?? 0).toFixed(2)}</div>
                </div>
            </div> 
            :
            <div>
                {true ? <div className="card" style={{borderRadius: "1rem", width: "16.35vw"}}>
                <div className="deposit-card-body deposit-card-design shadow" style={{paddingRight: "0", paddingLeft: "0", paddingTop: ".75rem", paddingBottom: ".75rem"}}>
                    {/*For every collateral asset with a non-zero balance in the wallet, add an amount form */}
                    {createDepositElements()}
                    {checkIfWalletEmpty() === false && address !== undefined ? 
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%"}} onClick={handleonboardingDeposit}>
                    Deposit
                    </a> 
                    : address === undefined ?
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%"}} onClick={()=>connect()}>                        
                    {/*If wallet is not connected, connect*/}
                    Connect Wallet
                    </a> 
                    :
                    <>
                    {/*If wallet is empty, give Bridge links*/}
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%"}} onClick={onIBCClick}>
                    {/*ibc.fun*/}
                    IBC
                    </a>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%"}} onClick={onCCTPClick}>
                    {/*cctp.money*/}
                    1-Click USDC
                    </a>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%"}} onClick={onSquidClick}>
                    {/*https://app.squidrouter.com/*/}
                    Misc.
                    </a>
                    </>
                    }
                </div>
                </div> : null}
            </div>
            }
        </div>
        {showDefault() ? <div className="controller-item">
            <div className="controller-frame">
                
                <div className="controller-label">
                    <div className="controller" onClick={currentfunctionLabel === "redemptions" ? handleredeeminfoClick : handleredeemScreen}>Collateral</div>
                </div>
                <div className="controller-screen-blank">                 
                    <div className="starting-screen">
                        { currentfunctionLabel === "" ? 
                        <div style={{fontSize: "medium", left: ".5vw", position: "relative"}}>Depositing requires assets on Osmosis. &nbsp;
                        <div className="nowrap" style={{textDecoration: "underline", display: "inline"}} onClick={onTFMTextClick}>IBC Bridge</div> / <div className="btn swap-button" >Swap</div>
                        </div>
                        : null}
                    </div>
                </div>            
                <div className={getTVL()*(maxLTV/100) < (debtAmount/1000000)*creditPrice ? "user-redemption-button red-border" : redeemButton} onClick={handleExecution}>
                    <div className="spacing-btm">{currentfunctionLabel === "deposit" ? "Deposit" : currentfunctionLabel === "withdraw" ? "Withdraw" : currentfunctionLabel === "redemptions" ? "Update" : getTVL() > 0 ? "Mint ---->" : "<---- Deposit" }</div>
                </div>    
                <div className={redeemScreen}>
                    <form>            
                        <input className="mint-button-icon2" style={{backgroundColor:"#454444"}} name="premium" value={premium} type="number" onChange={handlesetPremium}/>
                        <div className={posClick} onClick={handleposClick}/>
                        <div className={negClick} onClick={handlenegClick}/>
                        <div className="premium-label">Premium</div>
                        <input className="mint-button-icon5" style={{backgroundColor:"#454444"}} name="loan-usage" defaultValue={0.01} value={loanUsage} type="number" onChange={handlesetloanUsage}/>
                        <div className="loan-usage">% Loan Usage</div>
                    </form>
                    <div className="edit-redeemability">Redeemability Status</div>
                    <div className="click-assets-on">
                    {restrictedAssets.sentence}
                    </div>
                </div>
                <div className={redeemInfoScreen}>
                        <div className="user-redemptions">
                            <div>Premium: {redemptionRes?.premium_infos[0].premium }</div>
                            { redemptionRes !== undefined ? <div>Left to Redeem: {parseInt(redemptionRes?.premium_infos[0].users_of_premium[0].position_infos[0].remaining_loan_repayment)/ 1_000_000}</div> : null}
                            <div>Restricted Assets: {redemptionRes?.premium_infos[0].users_of_premium[0].position_infos[0].restricted_collateral_assets}</div>
                        </div>
                </div>
                <div className={depositwithdrawScreen}>
                    <div className={currentfunctionLabel === "deposit" ? "cdp-deposit-label bold" : "cdp-deposit-label low-opacity"} onClick={handledepositClick}>Deposit</div>
                    <div className="slash">/</div>
                    <div className={currentfunctionLabel === "withdraw" ? "cdp-withdraw-label bold" : "cdp-withdraw-label low-opacity"} onClick={handlewithdrawClick}>Withdraw</div>
                    <form>
                        { maxLPamount !== BigInt(0) ? (<><div className="max-amount-label" onClick={handlesetAmount}>max: {maxLPamount.toString()}</div></>) : null}            
                        <label className="amount-label">{currentAsset} amount:</label>     
                        <input className="amount" style={{backgroundColor:"#454444"}} name="amount" value={currentfunctionLabel !== "deposit" && currentfunctionLabel !== "withdraw" ? 0 : amount} type="number" onChange={handlesetAmountInput}/>
                    </form>
                </div>
            </div>
            {/* <div>
                <h3>Bundle Fortune teller</h3>
            </div> */}
        </div> : null}
        {showDefault() ? 
        <div className="debt-visual">
            <div className="infobox-icon"/>
            <div className="debtbar-visual">
                <div className="max-ltv">
                <div className="liq-value">${((((debtAmount/1_000000)* creditPrice) / (maxLTV / 100)) ?? 0).toFixed(2)}</div>
                <div className="cdp-div2">{(maxLTV ?? 0).toFixed(0)}%</div>
                <div className="max-ltv-child" />
                </div>
                <div className="max-borrow-ltv" style={{top: 39 + (335 * ((maxLTV-brwLTV)/maxLTV))}}>
                <div className="cdp-div3" >{(brwLTV ?? 0).toFixed(0)}%</div>
                <div className="max-borrow-ltv-child" />
                </div>
                <div className="debt-visual-child" />
                <div className="debt-visual-item" style={{top: 427 - (363 * ((((debtAmount/1_000000)* creditPrice)/(getTVL()+1)) / (maxLTV/100))), height: (340 * (((debtAmount/1_000000)* creditPrice)/(getTVL()+1)) / (maxLTV/100))}}/>
                <div className="debt-visual-label" style={{top: 407 - (359 * ((((debtAmount/1_000000)* creditPrice)/(getTVL()+1)) / (maxLTV/100)))}}>{(debtAmount/1000000).toString()} CDT</div>
                <input className="cdt-amount" style={{top: 63 + (335 * ((maxLTV-brwLTV)/maxLTV)), height: 445 - (100 + (335 * ((maxLTV-brwLTV)/maxLTV)))}} 
                id="amount" type="range" min="0" max={(getTVL()*(brwLTV/100))/Math.max(creditPrice, 1)} value={sliderValue} defaultValue={1} orient="vertical" onChange={({ target: { value: radius } }) => {                
                if (getTVL() !== 0 && debtAmount === 0 && parseInt(radius) < 100){
                    setsliderValue(100);
                } else if ((debtAmount/1000000) - parseInt(radius) > (walletCDT/1000000)){
                    setsliderValue((debtAmount - walletCDT)/1000000);

                    //Bc we know this is a repay (less than current debt), set amount to Wallet CDT
                    setAmount((walletCDT/1000000));
                    setcurrentfunctionLabel("repay");
                } else {
                    setsliderValue(parseInt(radius));

                    if (parseInt(radius) > (debtAmount/1000000)){
                        //Bc we know this is a mint (more than current debt), set amount to radius - debt amount. Radius at 114 -100 debt = 14 new mint
                        setAmount(parseInt((parseInt(radius) - (debtAmount/1000000)).toFixed(0)));
                        setcurrentfunctionLabel("mint");
                    } else if (parseInt(radius) === 0){
                        //Repay it all
                        setAmount((debtAmount/1000000));
                        setcurrentfunctionLabel("repay");
                    } else {
                        //Bc we know this is a repay (less than current debt), set amount to radius
                        setAmount(parseFloat(((debtAmount/1000000) - parseInt(radius)).toFixed(6)));
                        setcurrentfunctionLabel("repay");
                    }
                }
                }}/>
                <label className={sliderValue > (debtAmount/1000000) ? "green range-label" : sliderValue < (debtAmount/1000000) ? "red range-label" : "neutral range-label"} 
                //-(ratio of slidervalue to max value * (label starting point - the borrow_LTVs top position) + 395
                style={getTVL() !== 0 && debtAmount === 0 && sliderValue === 100 ? {left: "8.5vw", top: -((sliderValue/(getTVL()*(brwLTV/100))/Math.max(creditPrice, 1)) * (408 - (75 + (335 * ((maxLTV-brwLTV)/maxLTV)))))
                + (395)} : {top: -((sliderValue/(getTVL()*(brwLTV/100))/Math.max(creditPrice, 1)) * (408 - (75 + (335 * ((maxLTV-brwLTV)/maxLTV)))))
                + (395)}}>
                { getTVL() !== 0 && debtAmount === 0 && sliderValue === 100 ? "Minimum:" : (sliderValue - (debtAmount/1000000)) > 0 ? "+" : null}{((sliderValue - (debtAmount/1000000)) ?? 0).toFixed(0)}
                </label>
                <div className="cost-4">{cost > 0 ? "+" : null}{(cost ?? 0).toFixed(4)}%/yr</div>              
            </div>
            <div className="position-stats">
                <div className="infobox-icon2">            
                    <div className={currentfunctionLabel !== "repay" ? "low-opacity repay-button" : "repay-button"} onClick={handleExecution}>                
                        <div className="repay" onClick={handleExecution}>REPAY</div>
                    </div>
                    <div className={currentfunctionLabel !== "mint" ? "low-opacity mint-button" : "mint-button"} onClick={handleExecution}>
                        <div className="mint" onClick={handleExecution}>MINT</div>                
                    </div>
                    <Image className="cdt-logo-icon-cdp" width={45} height={45} alt="" src="/images/CDT.svg" />
                    <div className="position-visual-words"><span className="slider-desc">Slider up:</span> Mint CDT using your Bundle</div>
                    <div className="position-visual-words-btmright"><span className="slider-desc">Slider down:</span> Repay debt using CDT</div>
                </div>
            </div>
        </div> 
        : null}
        <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
        <WidgetPopup trigger={widgetpopupTrigger} setTrigger={setWidgetPopupTrigger} msgStatus={widgetpopupStatus} errorMsg={popupWidget}/>
    </div>
  );
};

export default Positions;
