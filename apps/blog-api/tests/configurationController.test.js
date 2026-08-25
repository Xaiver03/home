/* global afterEach, describe, expect, it, jest */

jest.mock('../services/configurationService', () => ({
  getAllConfiguration: jest.fn(),
}));
jest.mock('../utils/index', () => ({
  postMessage: jest.fn((code, msg, data) => ({ code, msg, data })),
}));

const configurationService = require('../services/configurationService');
const configurationController = require('../controller/configurationController');

describe('configurationController.getConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns only labels explicitly approved for the public site', async () => {
    const publicHonor = {
      id: 1,
      label: 'profile-honors',
      content: [
        {
          id: 'public-award',
          title: '公开荣誉',
          visibility: 'public',
          image: '/images/honors/public-award.webp',
          sourcePath: '/private/source.pdf',
        },
        {
          id: 'private-award',
          title: '私有荣誉',
          visibility: 'private',
          sourcePath: '/private/source.pdf',
        },
      ],
    };
    const publicLinks = { id: 2, label: 'siteLinks', content: [] };
    const privateSource = {
      id: 3,
      label: 'private-honor-sources',
      content: '/private/certificates',
    };
    const secret = { id: 4, label: 'smtp-password', content: 'secret' };
    configurationService.getAllConfiguration.mockResolvedValue({
      rows: [publicHonor, publicLinks, privateSource, secret],
    });
    const res = { json: jest.fn() };

    await configurationController.getConfig({}, res);

    expect(res.json).toHaveBeenCalledWith({
      'profile-honors': {
        ...publicHonor,
        content: [
          {
            id: 'public-award',
            title: '公开荣誉',
            visibility: 'public',
            image: '/images/honors/public-award.webp',
          },
        ],
      },
      siteLinks: publicLinks,
    });
  });
});
