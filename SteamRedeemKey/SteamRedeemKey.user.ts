// ==UserScript==
// @name        SteamRedeemKey
// @namespace   https://github.com/lzghzr/GreasemonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description 划Key激活
// @supportURL  https://github.com/lzghzr/GreasemonkeyJS/issues
// @match       *://*/*
// @license     MIT
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==
/// <reference path="SteamRedeemKey.d.ts" />
class SteamRedeemKey {
  constructor() {
  }
  private _elmDivSRK: HTMLDivElement
  private _D = document
  private _redeemKey: string
  private _left: number
  private _top: number
  public Start() {
    this._AddUI()
    this._D.addEventListener('mouseup', this._ShowUI.bind(this))
  }
  private _ShowUI(event) {
    setTimeout(() => {
      let oText = this._D.getSelection()
      let str = oText.toString()
      if (str.match(/[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}/)) {
        this._redeemKey = str
        this._top = document.body.scrollTop + event.clientY - 30
        this._left = document.body.scrollLeft + event.clientX
        this._elmDivSRK.style.cssText = `
          display: block;
          left: ${this._left}px;
          top: ${this._top}px;`
      }
      else {
        this._elmDivSRK.style.cssText = 'display: none;'
      }
    }, 0)
  }
  private _AddUI() {
    this._AddCSS()
    this._elmDivSRK = this._D.createElement('div')
    this._elmDivSRK.id = 'SRK_button'
    let html = '<div class="SRK_steam"></div>'
    this._elmDivSRK.innerHTML = html
    this._D.body.appendChild(this._elmDivSRK)
    this._elmDivSRK.addEventListener('click', this._ClickButton.bind(this))
  }
  private _ClickButton() {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `http://127.0.0.1:1242/IPC?command=redeem%20${this._redeemKey}`,
      onload: (res) => {
        if (res.status === 200) {
          let elmDivRedeem = this._D.createElement('div')
          elmDivRedeem.classList.add('SRK_redeem')
          elmDivRedeem.style.cssText = `
            left: ${this._left}px;
            top: ${this._top}px;`
          elmDivRedeem.innerHTML = res.responseText
          this._D.body.appendChild(elmDivRedeem)
        }
      }
    })
  }
  private _AddCSS() {
    let cssText = `
    #SRK_button {
      background: rgba(23, 26, 33, 0);
      border-radius: 50%;
      box-shadow: 0px 0px 10px 0px #171a21;
      cursor: pointer;
      display: none;
      height: 24px;
      position: absolute;
      width: 24px;
      z-index: 999;
    }
    .SRK_steam {
      background: no-repeat url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAFRklEQVR4XoXVCWwUVRzH8e+bmZ3dtvTulp4IiLZqBSQoIArKoSIKclQKyNUECInBeCXUCh5F41HFBA8EQSEcFZTbizMoqNAIJQE1CmI4WqhaaKHHzs6bvxuzoUlj6Sf5JflPkvd/8/Lyf8rO6E8rwVQ6Eg9DCZaS7igZC9yh4BYgGwCoFjgOHELUJi3qRCRoMSIxAYMoLP5fjggLw6KmglK0BYnATcB44A1gNVAKnCbqWg2KtKgVoGLogOcJAIahHgMKQWYBq9ptoOAJLcY7XIMyLUKXG6HhPCAAgAFJGX5/XMxKpb3OAm8SpezMOwFAKARZz7VYPpyzZ8AfYOKUMdvHPzJ8t4iois++vu+z1ZsfQGvsnGxw3ceANdEGdwMEgVoQ2qMsi9DZs6RkZTQe2L1ySn5e97015y4MVqYpGRlp+6qO/jJy4NBpK5rq6/3+jExEe1lAjQUmwBI6EG5oQdl+78C3FU/nd88+ff+YuXv8SmtBKcMOuFsqymfu31dR0qdgxNvhxjBWwF4GPKQCWUO7AqfoQEv1KQpnzqhav/T5uaMnz1sRTEms/2hxyauAKpox/0VlWWrdshfmPDjpuaVfrfs8P5CVC9DNMg1rmgjtU2BYJtDEvf1vrQ6H3eGNTY69ZU3JquhVpeLjsmVDH3nymZATHjatcNjxr9Z9mm8oC2C25boy0O+3EREQ2sIwFfW1dRgJN8rYhwedbgk5Wa7GBHIBBQiQrDWmoVSS47jJYEcKC2CQFbri3BY6/zdGMEhiQhzieUjr5nEjNU0XWf7pu5Wdg8ktgJWdma5HTZw/cfniZ3Z7nsfk2a/d37Pghgafz3JWbtjTGzMRw/IBXMfOfUf2FRW/8ldczmgXbhcShkvSDY9Kal6RJPQoFOglo6aV/SUiayPZHskWxwlvnTrnjfMjx5VceHh8ae3cee+dFZGPd31XVYl5l8R1HScpkTUiuaxEZCuQ9cefNbJ6/d70im0Hgr9U/hqD64LPole/W5ord71zxGcZDhALAIQAB0gAPKBu+87K3LFTygpQiuT0FLTnAVxRIrID6A+cBMLak5i1G79N+anq90DfXj2ak1MTnJFD+jQAvtYphge4Pxz+PX7jtgNxVSfOxe/65lCMERsgmJmKdlyiqpWILAeKgXNEjz0aDzDL39+cvG3/8dglZTMu3nR9lgMAqGdfXZNYvmhDPFdaIC2BpIxUbNvC0x6tOKhmLfhkweghvV96cHCvy4BHKxWtdfmKrxN2/PizuWPpU/UnT9eak57+oNOhXYeN2B7ZxHeKRWtNO95S5Ey8mbjA8X5985gwoq+ePmqAJMfH0oae+cpae8LwPl5R6SfmP7+dIZjfBUQQoX0ieSr9oRdwtP7yUk3dCBqaSM/L4cSGUi5caiSpU4C0xDgWbfiOuvom7undjWGTXic1PxflCR3YCzLE8vw2FswK9sg944lQ++sZXly1hyfGDGDxxu9xIgtfUVBWfB8z3tyI0TkNw/YjdECkGEClTS4HAGUUK6WWh13NpfMXeXLyYIb27Co15/6Rgpu7GIs2/cj6LypJ65YB2qNdSgEyB5EloFBp0xdzlWXONyzz5XDY5WJ1HalZKeSkJ8qxUxeUvtxCek4q4gnSdv/REsMAz1uI48xHBNR/Dd6N3hcPbB8EArMw1IeI0BwK47iaGNvC77MQkWtMRAUij9Pc8h7NzVf/xoLWIYcIwFKx7f2YZlkglrGB6HevneOI2orWpSoUOoZIB4++CHjyM7Y5DssqwDQmgeoPdAVSAAXUAadADqK9Clz3KOEwiNDWv8cbRuR4oLfxAAAAAElFTkSuQmCC");
      height: 24px;
      width: 24px;
    }
    .SRK_redeem {
      background: #FFF;
      color: #000;
      font-size: 15px;
      position: absolute;
      z-index: 999;
    }`
    let elmStyle = this._D.createElement('style')
    elmStyle.innerHTML = cssText
    this._D.body.appendChild(elmStyle)
  }
}
const redeem = new SteamRedeemKey()
redeem.Start()