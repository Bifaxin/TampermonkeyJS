// ==UserScript==
// @name        bilibili直播净化
// @namespace   https://github.com/lzghzr/GreasemonkeyJS
// @version     3.1.2
// @author      lzghzr
// @description 屏蔽聊天室礼物以及关键字, 净化聊天室环境
// @supportURL  https://github.com/lzghzr/GreasemonkeyJS/issues
// @include     /^https?:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/
// @license     MIT
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==
const defaultConfig = {
    version: 1590680982049,
    menu: {
        noKanBanMusume: {
            name: '屏蔽看板娘',
            enable: false
        },
        noGuardIcon: {
            name: '屏蔽舰队标识',
            enable: false
        },
        noVIPIcon: {
            name: '屏蔽老爷标识',
            enable: false
        },
        noMedalIcon: {
            name: '屏蔽粉丝勋章',
            enable: false
        },
        noUserLevelIcon: {
            name: '屏蔽用户等级',
            enable: false
        },
        noLiveTitleIcon: {
            name: '屏蔽成就头衔',
            enable: false
        },
        noSystemMsg: {
            name: '屏蔽系统公告',
            enable: false
        },
        noGiftMsg: {
            name: '屏蔽礼物信息',
            enable: false
        },
        noRaffle: {
            name: '屏蔽抽奖弹窗',
            enable: false
        },
        noBBChat: {
            name: '屏蔽刷屏聊天',
            enable: false
        },
        noBBDanmaku: {
            name: '屏蔽刷屏弹幕',
            enable: false
        }
    }
};
const userConfig = JSON.parse(GM_getValue('blnvConfig', JSON.stringify(defaultConfig)));
let config;
if (userConfig.version === undefined || userConfig.version < defaultConfig.version) {
    for (const x in defaultConfig.menu) {
        try {
            defaultConfig.menu[x].enable = userConfig.menu[x].enable;
        }
        catch (error) {
            console.error(error);
        }
    }
    config = defaultConfig;
}
else
    config = userConfig;
const elmStyleCSS = GM_addStyle('');
let noBBChat = false;
let noBBDanmaku = false;
AddCSS();
const chatMessage = new Map();
const chatObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            if (addedNode instanceof HTMLDivElement && addedNode.classList.contains('danmaku-item')) {
                const chatNode = addedNode.querySelector('.danmaku-content');
                if (chatNode !== null) {
                    const chatText = chatNode.innerText;
                    const dateNow = Date.now();
                    if (chatMessage.has(chatText) && dateNow - chatMessage.get(chatText) < 5000)
                        addedNode.remove();
                    chatMessage.set(chatText, dateNow);
                }
            }
        });
    });
});
const danmakuMessage = new Map();
const danmakuObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            const danmakuNode = addedNode instanceof Text ? addedNode.parentElement : addedNode;
            if (danmakuNode.className === 'bilibili-danmaku') {
                const danmakuText = danmakuNode.innerText;
                const dateNow = Date.now();
                if (danmakuMessage.has(danmakuText) && dateNow - danmakuMessage.get(danmakuText) < 5000)
                    danmakuNode.innerText = '';
                danmakuMessage.set(danmakuText, dateNow);
            }
        });
    });
});
setInterval(() => {
    const dateNow = Date.now();
    chatMessage.forEach((value, key) => {
        if (dateNow - value > 60 * 1000)
            chatMessage.delete(key);
    });
    danmakuMessage.forEach((value, key) => {
        if (dateNow - value > 60 * 1000)
            danmakuMessage.delete(key);
    });
}, 60 * 1000);
ChangeCSS();
let done = 0;
const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            if (done !== 1 && done !== 3 && addedNode instanceof HTMLLIElement && addedNode.innerText === '七日榜') {
                done += 1;
                addedNode.click();
            }
            else if (done !== 2 && done !== 3 && addedNode instanceof HTMLDivElement && addedNode.classList.contains('block-effect-ctnr')) {
                done += 2;
                AddUI(addedNode);
            }
            if (done === 3)
                bodyObserver.disconnect();
        });
    });
});
bodyObserver.observe(document.body, { childList: true, subtree: true });
function enableNOBBChat() {
    if (noBBChat)
        return;
    const elmDivChatList = document.querySelector('#chat-items');
    if (elmDivChatList !== null) {
        noBBChat = true;
        chatObserver.observe(elmDivChatList, { childList: true });
    }
}
function disableNOBBChat() {
    if (!noBBChat)
        return;
    noBBChat = false;
    chatObserver.disconnect();
}
function enableNOBBDanmaku() {
    if (noBBDanmaku)
        return;
    const elmDivDanmaku = document.querySelector('.bilibili-live-player-video-danmaku');
    if (elmDivDanmaku !== null) {
        noBBDanmaku = true;
        danmakuObserver.observe(elmDivDanmaku, { childList: true, subtree: true });
    }
}
function disableNOBBDanmaku() {
    if (!noBBDanmaku)
        return;
    noBBDanmaku = false;
    danmakuObserver.disconnect();
}
function ChangeCSS() {
    let cssText = '';
    if (config.menu.noKanBanMusume.enable)
        cssText += `
#my-dear-haruna-vm {
  display: none !important;
}`;
    if (config.menu.noGuardIcon.enable)
        cssText += `
.chat-item.guard-buy,
.chat-item.welcome-guard,
.chat-item .guard-icon,
.chat-item.guard-level-1:after,
.chat-item.guard-level-2:after,
.chat-item.guard-level-1:before,
.chat-item.guard-level-2:before {
  display: none !important;
}
.chat-item.guard-danmaku .vip-icon {
  margin-right: 4px !important;
}
.chat-item.guard-danmaku .admin-icon,
.chat-item.guard-danmaku .anchor-icon,
.chat-item.guard-danmaku .fans-medal-item-ctnr,
.chat-item.guard-danmaku .guard-icon,
.chat-item.guard-danmaku .title-label,
.chat-item.guard-danmaku .user-level-icon,
.chat-item.guard-danmaku .user-lpl-logo {
  margin-right: 5px !important;
}
.chat-item.guard-level-1,
.chat-item.guard-level-2 {
  padding: 4px 5px !important;
  margin: 0 !important;
}
.chat-item.guard-danmaku .user-name {
  color: #23ade5 !important;
}`;
    if (config.menu.noVIPIcon.enable)
        cssText += `
#activity-welcome-area-vm,
.chat-item .vip-icon,
.chat-item.welcome-msg {
  display: none !important;
}`;
    if (config.menu.noMedalIcon.enable)
        cssText += `
.chat-item .fans-medal-item-ctnr {
  display: none !important;
}`;
    if (config.menu.noUserLevelIcon.enable)
        cssText += `
.chat-item .user-level-icon {
  display: none !important;
}`;
    if (config.menu.noLiveTitleIcon.enable)
        cssText += `
.chat-item .title-label {
  display: none !important;
}`;
    if (config.menu.noSystemMsg.enable)
        cssText += `
.chat-item.misc-msg {
  display: none !important;
}`;
    if (config.menu.noGiftMsg.enable)
        cssText += `
#chat-gift-bubble-vm,
#penury-gift-msg,
#gift-screen-animation-vm,
#my-dear-haruna-vm .super-gift-bubbles,
.chat-item.gift-item,
.chat-item.system-msg,

.bilibili-live-player-video-operable-container>div:first-child>div:last-child,
.bilibili-live-player-video-gift,
.bilibili-live-player-danmaku-gift {
  display: none !important;
}
.chat-history-list.with-penury-gift {
  height: 100% !important;
}`;
    if (config.menu.noRaffle.enable)
        cssText += `
#player-effect-vm,
#chat-draw-area-vm {
  display: none !important;
}`;
    if (config.menu.noBBChat.enable)
        enableNOBBChat();
    else
        disableNOBBChat();
    if (config.menu.noBBDanmaku.enable)
        enableNOBBDanmaku();
    else
        disableNOBBDanmaku();
    elmStyleCSS.innerHTML = cssText;
}
function AddUI(addedNode) {
    const elmUList = addedNode.firstElementChild;
    const listLength = elmUList.childElementCount;
    const itemHTML = elmUList.firstElementChild.cloneNode(true);
    const itemInput = itemHTML.querySelector('input');
    const itemLabel = itemHTML.querySelector('Label');
    itemInput.id = itemInput.id.replace(/\d/, '');
    itemLabel.htmlFor = itemLabel.htmlFor.replace(/\d/, '');
    const selectedCheckBox = (spanClone) => {
        spanClone.classList.remove('checkbox-default');
        spanClone.classList.add('checkbox-selected');
    };
    const defaultCheckBox = (spanClone) => {
        spanClone.classList.remove('checkbox-selected');
        spanClone.classList.add('checkbox-default');
    };
    let i = listLength;
    for (const x in config.menu) {
        const itemHTMLClone = itemHTML.cloneNode(true);
        const itemSpanClone = itemHTMLClone.querySelector('span');
        const itemInputClone = itemHTMLClone.querySelector('input');
        const itemLabelClone = itemHTMLClone.querySelector('label');
        itemInputClone.id += i;
        itemLabelClone.htmlFor += i;
        i++;
        itemLabelClone.innerText = config.menu[x].name;
        itemInputClone.checked = config.menu[x].enable;
        if (itemInputClone.checked)
            selectedCheckBox(itemSpanClone);
        else
            defaultCheckBox(itemSpanClone);
        itemInputClone.addEventListener('change', (ev) => {
            const evt = ev.target;
            if (evt.checked)
                selectedCheckBox(itemSpanClone);
            else
                defaultCheckBox(itemSpanClone);
            config.menu[x].enable = evt.checked;
            GM_setValue('blnvConfig', JSON.stringify(config));
            ChangeCSS();
        });
        elmUList.appendChild(itemHTMLClone);
    }
}
function AddCSS() {
    GM_addStyle(`
.gift-block {
  border: 2px solid #c8c8c8;
  border-radius: 50%;
  display: inline-block;
  height: 17px;
  text-align: center;
  width: 17px;
}
.gift-block:hover {
  border-color: #23ade5;
}
.gift-block:before {
  content: '滚' !important;
  font-size: 13px;
  vertical-align: top;
}
/*隐藏网页全屏榜单*/
.player-full-win .rank-list-section {
  display: none !important;
}
.player-full-win .chat-history-panel {
  height: calc(100% - 135px) !important;
}`);
}