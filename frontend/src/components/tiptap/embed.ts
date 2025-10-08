import { Node } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state';


export interface EmbedOptions {
  allowFullscreen: boolean
  HTMLAttributes: {
    [key: string]: any
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /**
       * Add an embed
       */
      setEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export default Node.create<EmbedOptions>({
  name: 'embed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'embed-wrapper',
      },
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="embed"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src || '';
    // Instagram video embed detection
    console.log('Embed src:', src);
    const isInstagram = src.includes('instagram.com');
    if (isInstagram) {
      // Extract shortcode for posts
      const postMatch = src.match(/instagram\.com\/(?:[\w.-]+\/)?p\/([\w-]+)/);
      if (postMatch && postMatch[1]) {
        const shortcode = postMatch[1];
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed`;
        return [
          'div',
          { ...this.options.HTMLAttributes, 'data-type': 'embed' },
          [
            'iframe',
            {
              src: embedUrl,
              width: '400',
              height: '480',
              frameborder: '0',
              allowfullscreen: 'true',
              scrolling: 'no',
              allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
              class: 'embed-iframe',
            },
          ],
        ];
      }
      // Extract shortcode for reels
      const reelMatch = src.match(/instagram\.com\/(?:[\w.-]+\/)?reels?\/([\w-]+)/);
      if (reelMatch && reelMatch[1]) {
        const shortcode = reelMatch[1];
        const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`;
        return [
          'div',
          { ...this.options.HTMLAttributes, 'data-type': 'embed' },
          [
            'iframe',
            {
              src: embedUrl,
              width: '400',
              height: '480',
              frameborder: '0',
              allowfullscreen: 'true',
              scrolling: 'no',
              allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
              class: 'embed-iframe',
            },
          ],
        ];
      }
      // If no shortcode found, fallback to default
    }

    // TikTok support
    const isTikTok = src.includes('tiktok.com');
    if (isTikTok) {
      // Standard TikTok video URL: https://www.tiktok.com/@username/video/{id}
      console.log('Detected TikTok URL');
      const videoMatch = src.match(/tiktok\.com\/(?:@([\w.-]+)\/)?video\/([\d]+)/);
      if (videoMatch && videoMatch[2]) {
        const videoId = videoMatch[2];
        const embedUrl = `https://www.tiktok.com/embed/${videoId}`;
        return [
          'div',
          { ...this.options.HTMLAttributes, 'data-type': 'embed' },
          [
            'iframe',
            {
              src: embedUrl,
              width: '400',
              height: '720',
              frameborder: '0',
              allowfullscreen: 'true',
              scrolling: 'no',
              allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
              class: 'embed-iframe',
            },
          ],
        ];
      }
      // Short TikTok URL: https://vm.tiktok.com/{id}
      const shortMatch = src.match(/vm\.tiktok\.com\/([\w]+)/);
      if (shortMatch && shortMatch[1]) {
        // TikTok short URLs redirect to the full video URL, but we can't resolve it client-side without a request.
        // Optionally, you could show a message or try to embed, but TikTok does not support direct embed from short URLs.
        return [
          'div',
          { ...this.options.HTMLAttributes, 'data-type': 'embed' },
          ['span', {}, 'TikTok short links are not directly embeddable. Please paste the full video URL.'],
        ];
      }
    }
    // YouTube support
    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
    if (isYouTube) {
      // Match long URLs: https://www.youtube.com/watch?v=VIDEO_ID
      const longMatch = src.match(/youtube\.com\/watch\?v=([\w-]+)/);
      // Match short URLs: https://youtu.be/VIDEO_ID
      const shortMatch = src.match(/youtu\.be\/([\w-]+)/);
      // Match shorts URLs: https://www.youtube.com/shorts/VIDEO_ID
      const shortsMatch = src.match(/youtube\.com\/shorts\/([\w-]+)/);
      const videoId = longMatch ? longMatch[1] : shortMatch ? shortMatch[1] : shortsMatch ? shortsMatch[1] : null;
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return [
          'div',
          { ...this.options.HTMLAttributes, 'data-type': 'embed' },
          [
            'iframe',
            {
              src: embedUrl,
              width: '560',
              height: '315',
              frameborder: '0',
              allowfullscreen: 'true',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
              class: 'embed-iframe',
            },
          ],
        ];
      }
    }
    // Default embed (generic iframe)
    return [
      'div',
      { ...this.options.HTMLAttributes, 'data-type': 'embed' },
      [
        'iframe',
  { ...HTMLAttributes, class: 'embed-iframe' },
      ],
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (options: { src: string }) =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const node = this.type.create(options);
          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }
          return true;
        },
    }
  },

  addProseMirrorPlugins() {
    // Paste handler for Instagram and TikTok links
    return [
      new Plugin({
        key: new PluginKey('embed-paste-handler'),
        props: {
          handlePaste: (view: any, event: ClipboardEvent, slice: any) => {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return false;
            const text = clipboardData.getData('text/plain');
            if (text) {
              // Instagram
              if (text.match(/https?:\/\/(www\.)?instagram\.com\//)) {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    this.type.create({ src: text })
                  )
                );
                return true;
              }
              // TikTok
              if (text.match(/https?:\/\/(www\.)?tiktok\.com\//) || text.match(/https?:\/\/vm\.tiktok\.com\//)) {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    this.type.create({ src: text })
                  )
                );
                return true;
              }
              // YouTube
              if (
                text.match(/https?:\/\/(www\.)?youtube\.com\//) ||
                text.match(/https?:\/\/youtu\.be\//) ||
                text.match(/https?:\/\/(www\.)?youtube\.com\/shorts\//)
              ) {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    this.type.create({ src: text })
                  )
                );
                return true;
              }
            }
            return false;
          },
        },
      })
    ];
  },
})