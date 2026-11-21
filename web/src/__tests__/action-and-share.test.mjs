import assert from 'node:assert';
import test, { describe, it, beforeEach, mock } from 'node:test';

/**
 * -------------------------------------------------------------
 * 1. Web Share Handler Implementation Test
 * (from web/src/app/scholarships/[id]/page.tsx & web/src/app/blog/[id]/page.tsx)
 * -------------------------------------------------------------
 */
function createWebShareHandler({ navigator, window, alert }) {
  let feedback = null;

  const handleShare = async (scholarship) => {
    if (navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: scholarship?.title,
          text: `Check out this scholarship: ${scholarship?.title}`,
          url: window?.location?.href,
        });
        feedback = { type: 'native_share', success: true };
      } catch (err) {
        feedback = { type: 'native_share', error: err };
      }
    } else if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(window?.location?.href);
        if (alert) alert('Link copied to clipboard!');
        feedback = { type: 'clipboard', success: true, text: window?.location?.href };
      } catch (err) {
        feedback = { type: 'clipboard', error: err };
      }
    } else {
      feedback = { type: 'unsupported' };
    }

    return feedback;
  };

  return { handleShare };
}

/**
 * -------------------------------------------------------------
 * 2. Web Action Button Handlers (Apply, Save, SOP Generator)
 * -------------------------------------------------------------
 */
function createWebActionHandlers({ user, scholarship, apiService, router }) {
  let isSaved = scholarship?.is_saved || false;
  let saveId = scholarship?.save_id || null;

  const handleApply = (options = {}) => {
    if (scholarship.official_link) {
      return { action: 'open_official', url: scholarship.official_link };
    }
    return { action: 'open_external', url: scholarship.application_url || scholarship.website_url || null };
  };

  const handleAgencyApply = () => {
    if (!user) {
      router.push('/login');
      return { redirected: '/login' };
    }
    const target = `/scholarships/apply/agency/${scholarship.id}?title=${encodeURIComponent(scholarship.title || '')}`;
    router.push(target);
    return { navigated: target };
  };

  const handleGenerateSOP = () => {
    if (!user) {
      router.push('/login');
      return { redirected: '/login' };
    }
    const target = `/ai-tools/sop-helper?scholarshipId=${scholarship.id}&scholarshipTitle=${encodeURIComponent(scholarship.title || '')}`;
    router.push(target);
    return { navigated: target };
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/login');
      return { redirected: '/login' };
    }

    if (isSaved && saveId) {
      const res = await apiService.unsaveScholarship(saveId);
      if (res.ok) {
        isSaved = false;
        saveId = null;
        return { isSaved: false, saveId: null };
      }
    } else {
      const res = await apiService.saveScholarship(scholarship.id);
      if (res.ok) {
        isSaved = true;
        saveId = res.data.id;
        return { isSaved: true, saveId: res.data.id };
      }
    }
    return { isSaved, saveId };
  };

  return {
    handleApply,
    handleAgencyApply,
    handleGenerateSOP,
    handleSave,
    getState: () => ({ isSaved, saveId })
  };
}

/**
 * -------------------------------------------------------------
 * 3. Mobile Share & Action Handlers (React Native Simulation)
 * (from mobile/app/(tabs)/scholarships/[id].js)
 * -------------------------------------------------------------
 */
function createMobileHandlers({ details, Share, WebBrowser, Linking, showToast }) {
  const onShare = async () => {
    try {
      const res = await Share.share({
        message: `Check out this scholarship: ${details.title}\nLevel: ${details.level}\nDeadline: ${details.deadline}`,
      });
      return { success: true, res };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const openUrl = async (url) => {
    if (!url) {
      showToast('No URL provided', 'error');
      return { error: 'No URL provided' };
    }
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    try {
      await WebBrowser.openBrowserAsync(targetUrl);
      return { opened: targetUrl, method: 'WebBrowser' };
    } catch (e) {
      await Linking.openURL(targetUrl);
      return { opened: targetUrl, method: 'Linking' };
    }
  };

  return { onShare, openUrl };
}

/**
 * -------------------------------------------------------------
 * TEST SUITE EXECUTION
 * -------------------------------------------------------------
 */
describe('Action & Share Buttons Test Suite', () => {

  describe('Web Share Button Tests', () => {
    it('Case 1: Should trigger navigator.share when Web Share API is supported', async () => {
      let sharedPayload = null;
      const fakeNavigator = {
        share: async (payload) => {
          sharedPayload = payload;
          return true;
        }
      };
      const fakeWindow = { location: { href: 'https://scholarshipconnectbd.com/scholarships/101' } };

      const handler = createWebShareHandler({ navigator: fakeNavigator, window: fakeWindow });
      const result = await handler.handleShare({ title: 'DAAD Germany Scholarship' });

      assert.strictEqual(result.type, 'native_share');
      assert.strictEqual(result.success, true);
      assert.strictEqual(sharedPayload.title, 'DAAD Germany Scholarship');
      assert.strictEqual(sharedPayload.url, 'https://scholarshipconnectbd.com/scholarships/101');
    });

    it('Case 2: Should fallback to clipboard.writeText when navigator.share is unavailable', async () => {
      let copiedText = null;
      let alertMessage = null;

      const fakeNavigator = {
        clipboard: {
          writeText: async (text) => {
            copiedText = text;
          }
        }
      };
      const fakeWindow = { location: { href: 'https://scholarshipconnectbd.com/scholarships/202' } };
      const fakeAlert = (msg) => { alertMessage = msg; };

      const handler = createWebShareHandler({ navigator: fakeNavigator, window: fakeWindow, alert: fakeAlert });
      const result = await handler.handleShare({ title: 'Chevening UK' });

      assert.strictEqual(result.type, 'clipboard');
      assert.strictEqual(result.success, true);
      assert.strictEqual(copiedText, 'https://scholarshipconnectbd.com/scholarships/202');
      assert.strictEqual(alertMessage, 'Link copied to clipboard!');
    });
  });

  describe('Web Action Buttons (Apply, SOP, Save Bookmark) Tests', () => {
    it('Case 3: Apply button should prioritize official_link when available', () => {
      const mockScholarship = {
        id: 1,
        title: 'MEXT Japan',
        official_link: 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html',
        website_url: 'https://example.com'
      };

      const { handleApply } = createWebActionHandlers({ scholarship: mockScholarship });
      const res = handleApply();

      assert.strictEqual(res.action, 'open_official');
      assert.strictEqual(res.url, 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html');
    });

    it('Case 4: Agency Apply button should redirect unauthenticated user to /login', () => {
      const pushedRoutes = [];
      const fakeRouter = { push: (r) => pushedRoutes.push(r) };

      const { handleAgencyApply } = createWebActionHandlers({
        user: null, // Logged out
        scholarship: { id: 5, title: 'Turkiye Burslari' },
        router: fakeRouter
      });

      const res = handleAgencyApply();
      assert.strictEqual(res.redirected, '/login');
      assert.strictEqual(pushedRoutes[0], '/login');
    });

    it('Case 5: Agency Apply button should navigate to agency application screen when user is logged in', () => {
      const pushedRoutes = [];
      const fakeRouter = { push: (r) => pushedRoutes.push(r) };

      const { handleAgencyApply } = createWebActionHandlers({
        user: { id: 10, email: 'student@example.com' },
        scholarship: { id: 5, title: 'Turkiye Burslari' },
        router: fakeRouter
      });

      const res = handleAgencyApply();
      assert.ok(res.navigated.includes('/scholarships/apply/agency/5'));
      assert.ok(res.navigated.includes('title=Turkiye%20Burslari'));
      assert.strictEqual(pushedRoutes[0], res.navigated);
    });

    it('Case 6: SOP Helper button should navigate to /ai-tools/sop-helper with query params', () => {
      const pushedRoutes = [];
      const fakeRouter = { push: (r) => pushedRoutes.push(r) };

      const { handleGenerateSOP } = createWebActionHandlers({
        user: { id: 10 },
        scholarship: { id: 7, title: 'Erasmus Mundus' },
        router: fakeRouter
      });

      const res = handleGenerateSOP();
      assert.ok(res.navigated.includes('/ai-tools/sop-helper?scholarshipId=7'));
      assert.ok(res.navigated.includes('scholarshipTitle=Erasmus%20Mundus'));
    });

    it('Case 7: Save / Bookmark button should toggle save and unsave properly', async () => {
      const fakeApiService = {
        saveScholarship: async (id) => ({ ok: true, data: { id: 999 } }),
        unsaveScholarship: async (saveId) => ({ ok: true, data: {} })
      };

      const handler = createWebActionHandlers({
        user: { id: 10 },
        scholarship: { id: 42, is_saved: false },
        apiService: fakeApiService
      });

      // 1st click: Save
      const saveRes = await handler.handleSave();
      assert.strictEqual(saveRes.isSaved, true);
      assert.strictEqual(saveRes.saveId, 999);

      // 2nd click: Unsave
      const unsaveRes = await handler.handleSave();
      assert.strictEqual(unsaveRes.isSaved, false);
      assert.strictEqual(unsaveRes.saveId, null);
    });
  });

  describe('Mobile Action & Share Tests', () => {
    it('Case 8: Mobile Share should construct and pass standard message format to Share.share', async () => {
      let sharedMessage = null;
      const fakeShare = {
        share: async (payload) => {
          sharedMessage = payload.message;
          return { action: 'sharedAction' };
        }
      };

      const { onShare } = createMobileHandlers({
        details: {
          title: 'Fullbright USA',
          level: 'Postgraduate',
          deadline: '2026-12-01'
        },
        Share: fakeShare
      });

      const result = await onShare();
      assert.strictEqual(result.success, true);
      assert.ok(sharedMessage.includes('Check out this scholarship: Fullbright USA'));
      assert.ok(sharedMessage.includes('Level: Postgraduate'));
      assert.ok(sharedMessage.includes('Deadline: 2026-12-01'));
    });

    it('Case 9: Mobile openUrl should prepend https:// if missing and call WebBrowser', async () => {
      let openedUrl = null;
      const fakeWebBrowser = {
        openBrowserAsync: async (url) => {
          openedUrl = url;
          return { type: 'opened' };
        }
      };

      const { openUrl } = createMobileHandlers({
        WebBrowser: fakeWebBrowser
      });

      const res = await openUrl('www.daad.de/en');
      assert.strictEqual(res.opened, 'https://www.daad.de/en');
      assert.strictEqual(openedUrl, 'https://www.daad.de/en');
      assert.strictEqual(res.method, 'WebBrowser');
    });

    it('Case 10: Mobile openUrl should show error toast when URL is missing', async () => {
      let toastMsg = null;
      const fakeToast = (msg, type) => { toastMsg = `${type}: ${msg}`; };

      const { openUrl } = createMobileHandlers({
        showToast: fakeToast
      });

      const res = await openUrl('');
      assert.strictEqual(res.error, 'No URL provided');
      assert.strictEqual(toastMsg, 'error: No URL provided');
    });
  });
});
