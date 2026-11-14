'use strict';

class AIRich {
    constructor(conn) {
        this.conn = conn;
        this.submessages = [];
        this.contextInfo = undefined;
    }

    addText(text) {
        this.submessages.push({
            messageType: 2,
            messageText: String(text)
        });
        return this;
    }

    addCode(language, code) {
        this.submessages.push({
            messageType: 5,
            codeMetadata: {
                codeLanguage: String(language),
                codeBlocks: [{
                    codeContent: String(code)
                }]
            }
        });
        return this;
    }

    addTable(headers = [], rows = [], title) {
        this.submessages.push({
            messageType: 4,
            tableMetadata: {
                title,
                rows: [
                    { items: headers.map(String), isHeading: true },
                    ...rows.map(row => ({
                        items: row.map(String)
                    }))
                ]
            }
        });
        return this;
    }

    addMap(map = {}) {
        this.submessages.push({
            messageType: 7,
            mapMetadata: {
                centerLatitude: map.latitude,
                centerLongitude: map.longitude,
                latitudeDelta: map.latitudeDelta ?? 0.01,
                longitudeDelta: map.longitudeDelta ?? 0.01,
                showInfoList: map.showInfoList,
                annotations: (map.annotations || []).map((item, i) => ({
                    annotationNumber: item.annotationNumber ?? i + 1,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    title: item.title || '',
                    body: item.body || ''
                }))
            }
        });
        return this;
    }

    addLatex(text, expressions = []) {
        this.submessages.push({
            messageType: 8,
            latexMetadata: {
                text: String(text),
                expressions: expressions.map(item =>
                    typeof item === 'string'
                        ? { latexExpression: item }
                        : item
                )
            }
        });
        return this;
    }

    addImage(url, options = {}) {
        this.submessages.push({
            messageType: 3,
            imageMetadata: {
                imageUrl: {
                    imagePreviewUrl: options.previewUrl || url,
                    imageHighResUrl: options.highResUrl || url,
                    sourceUrl: options.sourceUrl || url
                },
                imageText: options.text || '',
                alignment: options.alignment ?? 2,
                tapLinkUrl: options.tapLinkUrl
            }
        });
        return this;
    }

    addGridImage(gridImageUrl, imageUrls = []) {
        const formatUrl = item => typeof item === 'string'
            ? {
                imagePreviewUrl: item,
                imageHighResUrl: item,
                sourceUrl: item
            }
            : item;

        this.submessages.push({
            messageType: 1,
            gridImageMetadata: {
                gridImageUrl: formatUrl(gridImageUrl),
                imageUrls: imageUrls.map(formatUrl)
            }
        });
        return this;
    }

    addDynamic(url, options = {}) {
        this.submessages.push({
            messageType: 6,
            dynamicMetadata: {
                type: options.type ?? 1,
                version: options.version ?? 1,
                url: String(url),
                loopCount: options.loopCount
            }
        });
        return this;
    }

    addContentItems(items = [], options = {}) {
        this.submessages.push({
            messageType: 9,
            contentItemsMetadata: {
                contentType: options.contentType ?? 0,
                itemsMetadata: items.map(item => ({
                    reelItem: {
                        title: item.title || '',
                        profileIconUrl: item.profileIconUrl || '',
                        thumbnailUrl: item.thumbnailUrl || '',
                        videoUrl: item.videoUrl || ''
                    }
                }))
            }
        });
        return this;
    }

    addMetadata(contextInfo) {
        this.contextInfo = contextInfo;
        return this;
    }

    addProduct() {
        throw new Error(
            'addProduct belum didukung: schema AIRich product belum tersedia.'
        );
    }

    addEmbeddedScreen() {
        throw new Error(
            'addEmbeddedScreen belum didukung: schema embedded screen belum tersedia.'
        );
    }

    addPost() {
        throw new Error(
            'addPost belum didukung: schema post belum tersedia.'
        );
    }

    addPrimitive() {
        throw new Error(
            'addPrimitive belum didukung: schema GenAI primitive belum tersedia.'
        );
    }

    build() {
        const richResponseMessage = {
            messageType: 1,
            submessages: this.submessages
        };

        if (this.contextInfo !== undefined) {
            richResponseMessage.contextInfo = this.contextInfo;
        }

        return { richResponseMessage };
    }

    async send(jid, options = {}) {
        if (!this.conn?.relayMessage) {
            throw new Error('Koneksi Baileys tidak valid.');
        }

        return this.conn.relayMessage(
            jid,
            this.build(),
            options
        );
    }
}

module.exports = { AIRich };
