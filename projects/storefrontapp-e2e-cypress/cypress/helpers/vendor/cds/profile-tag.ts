export const profileTagHelper = {
  interceptProfileTagJs(contentWindow) {
    const oldAppendChild = contentWindow.document.head.appendChild;
    contentWindow.document.head.appendChild = function (newChild) {
      if (
        newChild &&
        (<HTMLScriptElement>(<any>newChild)).src &&
        (<HTMLScriptElement>(<any>newChild)).src.indexOf('profile-tag') !== -1
      ) {
        return newChild;
      }
      return oldAppendChild.call(this, newChild);
    };
  },
<<<<<<< HEAD
  triggerLoaded() {
    cy.window().then(win => {
      const event = new CustomEvent('profiletag_loaded');
      win.dispatchEvent(event);
    });
  },
  triggerConsentReferenceLoaded() {
    cy.window().then(win => {
      const event = new CustomEvent('profiletag_consentReferenceLoaded', {
        detail: { consentReference: profileTagHelper.testCr },
      });
      win.dispatchEvent(event);
    });
  },
  waitForCMSComponents(timeout = 7000) {
    cy.get('cx-profiletag', { timeout });
  },
  testCr: '123-1bc',
=======
>>>>>>> 3d58b479cd9ad4c015632977e632f6d52e72dddd
  profileTagScriptResponse: {},
};
