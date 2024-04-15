class Client {
    constructor() {
        this.peerConnection = null;
    }

    destroyClient(){
        this.peerConnection = null;
    }

    initializePeerConnection() {
        if (!this.peerConnection) {
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                ]
            });
            this.isAudioEnabled = true;
            this.isVideoEnabled = false;
        }
    }

    async getOffer() {
        if (this.peerConnection) {
            try {
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                return offer;
            } catch (error) {
                console.error("Error creating offer:", error);
                return null;
            }
        }
    }

    async getAnswer(offer) {
        if (this.peerConnection) {
            try {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                return answer;
            } catch (error) {
                console.error("Error creating answer:", error);
                return null;
            }
        }
    }

    async setRemoteLocalDescription(answer) {
        if (this.peerConnection) {
            try {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error("Error setting remote description:", error);
            }
        }
    }
}

export default Client;
