//
//  NodesList.ts
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "./AddressManager";
import DomainHandler from "./DomainHandler";
import FingerprintUtils from "./FingerprintUtils";
import LimitedNodeList from "./LimitedNodeList";
import NodeType, { NodeTypeValue } from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import ReceivedMessage from "./ReceivedMessage";
import PacketData from "./packets/PacketData";
import PacketType, { protocolVersionsSignature } from "./udt/PacketHeaders";
import NLPacket from "../networking/NLPacket";
import Uuid from "../shared/Uuid";


/*@devdoc
 *  Manages the domain server plus all the nodes (assignment clients) that the client is connected to. This includes their
 *  presence and communications with them via the Vircadia protocol.
 *  <p>C++: <code>NodeList : LimitedNodeList</code></p>
 *  <p>Note: This JavaScript object has a different name because <code>NodeList</code> is a JavaScript browser object.</p>
 *  @namespace NodesList
 *  @extends LimitedNodeList
 */
const NodesList = new class extends LimitedNodeList {
    // C++  NodeList : public LimitedNodeList

    private _ownerType: NodeTypeValue;
    private _connectReason = LimitedNodeList.ConnectReason.Connect;
    private _nodeTypesOfInterest: Set<NodeTypeValue> = new Set();

    private _domainHandler: DomainHandler;


    constructor(ownerType: NodeTypeValue, socketListenPort = LimitedNodeList.INVALID_PORT,
        dtlsListenPort = LimitedNodeList.INVALID_PORT) {
        // C++  NodeList(char ownerType, int socketListenPort = INVALID_PORT, int dtlsListenPort = INVALID_PORT);

        super(ownerType, socketListenPort, dtlsListenPort);

        this._ownerType = ownerType;

        // WEBRTC TODO: Address further C++ code.

        this._domainHandler = new DomainHandler();

        // WEBRTC TODO: Address further C++ code.

        AddressManager.possibleDomainChangeRequired.connect(this._domainHandler.setURLAndID);

        // WEBRTC TODO: Address further C++ code.

        this._packetReceiver.registerListener(PacketType.DomainList,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainList));

        // WEBRTC TODO: Address further C++ code.

        // Don't need to bind this to slots because this is a namespace.
    }

    /*@devdoc
     *  Gets the domain handler used by the NodesList.
     *  @function NodesList.getDomainHandler
     *  @returns {DomainHandler} The domain handler.
     */
    getDomainHandler() {
        // C++  DomainHandler& getDomainHandler()
        return this._domainHandler;
    }

    /*@devdoc
     *  Adds node types to the set of those that the NodesList will connect to.
     *  @function NodesList.addSetOfNodeTypesToNodeInterestSet
     *  @param {Set<NodeType>} setOfNodeTypes - The node types to add to the interest set.
     */
    addSetOfNodeTypesToNodeInterestSet(setOfNodeTypes: Set<NodeTypeValue>) {
        // C++  void addSetOfNodeTypesToNodeInterestSet(const NodeSet& setOfNodeTypes)
        for (const nodeType of setOfNodeTypes) {
            this._nodeTypesOfInterest.add(nodeType);
        }
    }

    /*@devdoc
     *  Gets the node types that the NodesList will connect to.
     *  @function NodesList.getNodeInterestSet
     *  @returns {Set<NodeType>} The node types in the interest set.
     */
    getNodeInterestSet() {
        // C++  NodeSet& getNodeInterestSet() const { return _nodeTypesOfInterest; }
        return this._nodeTypesOfInterest;
    }

    /*@devdoc
     *  Performs a check-in with the domain server to connect with a {@link PacketType(1)|DomainConnectRequest} packet or keep a
     *  connection alive with a {@link PacketType(1)|DomainListRequest} packet. This method should be called by the client once
     *  every second.
     *  @function NodesList.sendDomainServerCheckIn
     *  @returns {Slot}
     */
    sendDomainServerCheckIn() {
        // C++  void sendDomainServerCheckIn()

        // WEBRTC TODO: Address further C++ code.

        // The web client uses the domain URL rather than IP address.
        const domainURL = this._domainHandler.getURL();
        if (!domainURL || this._domainHandler.checkInPacketTimeout()) {
            return;
        }

        // We don't need to worry about getting our publicSockAddress because WebRTC handles this.
        // We don't need to worry about the domain handler requiring ICE because WebRTC handles this.
        // Instead, we open the WebRTC signaling and data channels if not already open.

        // Open the WebRTC signaling channel to the domain server if not already open.
        if (!this._nodeSocket.hasWebRTCSignalingChannel(domainURL)) {
            this._nodeSocket.openWebRTCSignalingChannel(domainURL);
            console.log("[Networking] Opening WebRTC signaling channel. Will not send domain server check-in.");
            return;
        }
        if (!this._nodeSocket.isWebRTCSignalingChannelOpen()) {
            console.log("[Networking] Waiting for WebRTC signaling channel. Will not send domain server check-in.");
            return;
        }

        // Open the WebRTC data channel to the domain server if not already open.
        if (!this._nodeSocket.hasWebRTCDataChannel(NodeType.DomainServer)) {
            console.log("[Networking] Opening WebRTC data channel. Will not send domain server check-in.");
            this._nodeSocket.openWebRTCDataChannel(NodeType.DomainServer, (dataChannelID) => {
                this._domainHandler.setPort(dataChannelID);
            });
        }
        if (!this._nodeSocket.isWebRTCDataChannelOpen(NodeType.DomainServer)) {
            console.log("[Networking] Waiting for WebRTC data channel. Will not send domain server check-in.");
            return;
        }

        // WEBRTC TODO: Rework the above to use QUdpSocket : QAbstractSocket style methods when add first assignment client.

        const isDomainConnected = this._domainHandler.isConnected();
        const domainPacketType = isDomainConnected ? PacketType.DomainListRequest : PacketType.DomainConnectRequest;
        const domainSockAddr = this._domainHandler.getSockAddr();

        if (!isDomainConnected) {

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

        // Create and send packet.
        let packet = undefined;
        if (domainPacketType === PacketType.DomainConnectRequest) {

            // Gather data needed for the packet.
            const connectUUID = new Uuid(Uuid.NULL);  // Always Uuid.NULL for Web Interface client.
            // Ignore ICE code because Interface didn't use ICE to discover the domain server.
            const protocolVersionSig = protocolVersionsSignature();

            const hardwareAddress = "";
            // WEBRTC TODO: Get MAC address.

            const machineFingerprint = FingerprintUtils.getMachineFingerprint();

            const compressedSystemInfo = new Uint8Array(new ArrayBuffer(0));
            // WEBRTC TODO: Get compressed system info.

            const connectReason = this._connectReason;

            const previousConnectionUptime = BigInt(0);
            // WEBRTC TODO: Calculate previousConnectionUpdate value.

            const currentTime = BigInt(Date.now().valueOf());

            const ownerType = this._ownerType;
            const publicSockAddr = super.getPublicSockAddr();
            const localSockAddr = super.getLocalSockAddr();
            const nodeTypesOfInterest = this._nodeTypesOfInterest;
            const placeName = AddressManager.getPlaceName();

            let username = undefined;
            let usernameSignature = undefined;
            const domainUsername = undefined;
            const domainTokens = undefined;
            if (!isDomainConnected) {
                username = "";
                usernameSignature = new Uint8Array(new ArrayBuffer(0));

                // WEBRTC TODO: Address further C++ code.

            }

            // Write the packet.
            packet = PacketData.DomainConnectRequest.write({
                connectUUID,
                protocolVersionSig,
                hardwareAddress,
                machineFingerprint,
                compressedSystemInfo,
                connectReason,
                previousConnectionUptime,
                currentTime,
                ownerType,
                publicSockAddr,
                localSockAddr,
                nodeTypesOfInterest,
                placeName,
                isDomainConnected,
                username,
                usernameSignature,
                domainUsername,
                domainTokens
            });

        } else {

            packet = new NLPacket(PacketType.DomainList);

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

        this.sendPacket(packet, domainSockAddr);
    }

    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainList} message received from the domain server.
     *  @function NodesList.processDomainList
     *  @param {ReceivedMessage} message - The DomainList message.
     *  @returns {Slot}
     */
    processDomainList = (message: ReceivedMessage) => {  // Lambda binds this.
        // C++  processDomainList(ReceivedMessage* message)

        // WEBRTC TODO: This should involve a NLPacketList, not just a single NLPacket.

        const info = PacketData.DomainList.read(message.getMessage());

        // WEBRTC TODO: Address further C++ code.

        if (!this._domainHandler.isConnected()) {
            this._domainHandler.setLocalID(info.domainLocalID);
            this._domainHandler.setUUID(info.domainUUID);
            this._domainHandler.setIsConnected(true);

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.
    };

}(NodeType.Agent);

export default NodesList;
