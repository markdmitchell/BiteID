# 📦 BiteID Batch Specimen & Image Upload Protocol

This protocol provides instructions for naming, labeling, structuring metadata, and batch uploading captured pest macro photographs and clinical lesion images into BiteID.

---

## 🏷️ 1. File Naming Scheme

Name each image file using the standard pattern:

`[vector_id]_[view_type]_[skin_phototype]_[specimen_id].[ext]`

### Quick Example
- `blacklegged_tick_dorsal_type1_specimen01.jpg`
- `brown_recluse_dorsal_type5_specimen02.jpg`
- `black_widow_ventral_type4_specimen01.jpg`
- `no_see_um_macro_type1_specimen01.jpg`
- `blister_beetle_profile_type3_specimen01.jpg`

---

## 📋 2. Parameter Reference Guide

### A. Vector Identifiers (`vector_id`)
Must use one of the 19 canonical vector keys:
- Ticks: `blacklegged_tick`, `lone_star_tick`, `dog_tick`
- Spiders & Arachnids: `brown_recluse`, `black_widow`, `scorpion`
- Flies & Midges: `mosquito`, `horse_fly`, `black_fly`, `no_see_um`
- Stinging Insects: `honey_bee`, `wasp`, `fire_ant`
- Creeping Vector Pests: `bed_bug`, `flea`, `chigger`, `lice`, `kissing_bug`, `blister_beetle`

### B. View Type (`view_type`)
- `dorsal`: Top-down view (scutum, wing venation, spider cephalothorax)
- `ventral`: Underside view (spider hourglass marking, leg attachment)
- `profile`: Side view (thoracic hump, body height)
- `macro`: Close-up view with scale coin/ruler
- `lesion`: Clinical skin bite reaction photo

### C. Skin Phototype (`skin_phototype`)
- `type1` (Pale White), `type2` (Fair), `type3` (Medium), `type4` (Light Brown), `type5` (Dark Brown), `type6` (Deeply Pigmented), or `none` (for specimen-only photos).

---

## 📄 3. Metadata Manifest JSON Template (`manifest.json`)

Place a single `manifest.json` file inside your upload folder alongside your images to automatically attach metadata:

```json
{
  "batchId": "batch_2026_09_10_01",
  "uploader": "Field Team / User",
  "images": [
    {
      "filename": "blacklegged_tick_dorsal_type1_specimen01.jpg",
      "vectorId": "blacklegged_tick",
      "viewType": "dorsal",
      "scaleIndicator": "mm_ruler",
      "usState": "US-VA",
      "captureDate": "2026-09-10",
      "skinPhototype": "Type I",
      "sourceAttribution": "Public Health Surveillance"
    }
  ]
}
```

---

## 📤 4. Upload Methods

1. **Direct Chat Multi-Upload**: Drag and drop up to 10 image files into the chat interface simultaneously.
2. **Local Directory Drop**: Place image files and `manifest.json` into `public/specimens/batch_uploads/` in the codebase.
3. **Automated Pipeline Execution**: Run `pnpm ingest:specimens` to parse, validate, and index all batch uploads automatically.
