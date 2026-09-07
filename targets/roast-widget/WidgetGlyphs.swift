import Foundation

/**
 One SF Symbol per task kind.

 ⚠️ **Mirrored from `constants/widget-glyphs.ts`**, which carries the same six shapes as
 SVG paths for Android. The two platforms cannot share an asset, so they share a table —
 and the symbol names below appear as comments beside their Android counterparts.

 Shape carries the kind; colour carries the urgency. Every glyph renders in the accent
 colour and switches to overdue when the row is. Six kinds in six tints would look like a
 toy, would spend the colour budget on the distinction nobody needs, and would collapse
 into six identical grey shapes in iOS 18's tinted mode — where a silhouette still reads.

 `kind` arrives as a raw string from the snapshot rather than as an enum, because the
 extension routinely decodes a snapshot written by a *newer* app: an unknown kind has to
 fall back, never crash.
 */
enum WidgetGlyph {
    static func name(for kind: String) -> String {
        switch kind {
        case "REMINDER": return "bell.fill"
        case "CALL_DUE": return "phone.fill"
        case "FOLLOW_UP": return "arrow.uturn.left"
        case "INVITE": return "envelope.fill"
        case "NOTE": return "square.and.pencil"
        case "PROGRESS": return "chart.line.uptrend.xyaxis"
        default: return "bell.fill"
        }
    }
}

/**
 The three ways a row can reach a guest, in the order they are rendered.

 ⚠️ **Mirrors `WIDGET_CONTACT_CHANNELS` in `utils/contact-links.ts` and `ACTION_PATHS` in
 `constants/widget-glyphs.ts`.** The raw values are `ContactChannel`'s, because they travel
 in the deep link this widget builds and the app parses them straight back into that enum.

 WhatsApp is the awkward one: its brand mark is not an SF Symbol and never will be, so the
 two platforms cannot draw the same thing. The strip is therefore semantic rather than
 branded — **one bubble is a text message, two bubbles are the chat app, a handset is a
 call** — which also survives iOS 18's tinted mode, where a brand colour would not.
 */
enum WidgetContactChannel: String, CaseIterable {
    case call = "CALL"
    case whatsapp = "WHATSAPP"
    case sms = "SMS"

    var symbol: String {
        switch self {
        case .call: return "phone.fill"
        case .whatsapp: return "bubble.left.and.bubble.right.fill"
        case .sms: return "message.fill"
        }
    }

    /// What a screen reader says, and what the app's handoff screen shows while it waits.
    var label: String {
        switch self {
        case .call: return "Call"
        case .whatsapp: return "WhatsApp"
        case .sms: return "Text"
        }
    }
}
