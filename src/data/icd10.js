// ICD-10 Spine Codes — common diagnoses for spine surgery

const ICD10_CODES = {
  "Degenerative": [
    { code: "M47.816", desc: "Spondylosis w/o myelopathy, lumbar" },
    { code: "M47.812", desc: "Spondylosis w/o myelopathy, cervical" },
    { code: "M47.16", desc: "Spondylosis w/ myelopathy, lumbar" },
    { code: "M47.12", desc: "Spondylosis w/ myelopathy, cervical" },
    { code: "M48.06", desc: "Spinal stenosis, lumbar" },
    { code: "M48.02", desc: "Spinal stenosis, cervical" },
    { code: "M48.04", desc: "Spinal stenosis, thoracic" },
    { code: "M51.16", desc: "IVD degeneration, lumbar, radiculopathy" },
    { code: "M51.17", desc: "IVD degeneration, lumbosacral, radiculopathy" },
    { code: "M50.12", desc: "Cervical disc degeneration, mid-cervical" },
    { code: "M50.120", desc: "Cervical disc degeneration, C4-C5" },
    { code: "M50.121", desc: "Cervical disc degeneration, C5-C6" },
    { code: "M50.122", desc: "Cervical disc degeneration, C6-C7" },
  ],
  "Disc Herniation": [
    { code: "M51.06", desc: "IVD herniation, lumbar, myelopathy" },
    { code: "M51.26", desc: "IVD herniation, lumbar, other" },
    { code: "M51.27", desc: "IVD herniation, lumbosacral" },
    { code: "M50.020", desc: "Cervical disc herniation, C4-C5, myelopathy" },
    { code: "M50.021", desc: "Cervical disc herniation, C5-C6, myelopathy" },
    { code: "M50.022", desc: "Cervical disc herniation, C6-C7, myelopathy" },
  ],
  "Spondylolisthesis": [
    { code: "M43.16", desc: "Spondylolisthesis, lumbar" },
    { code: "M43.10", desc: "Spondylolisthesis, site unspecified" },
    { code: "Q76.2", desc: "Congenital spondylolisthesis" },
  ],
  "Fracture": [
    { code: "S12.000A", desc: "Fracture of first cervical vertebra, initial" },
    { code: "S22.009A", desc: "Fracture of unspecified thoracic vertebra, initial" },
    { code: "S32.009A", desc: "Fracture of unspecified lumbar vertebra, initial" },
    { code: "S32.10xA", desc: "Fracture of sacrum, initial" },
    { code: "M48.56xA", desc: "Collapsed vertebra, lumbar, initial" },
    { code: "M80.08xA", desc: "Age-related osteoporosis with pathological fracture" },
  ],
  "Deformity": [
    { code: "M41.00", desc: "Infantile idiopathic scoliosis, site unspecified" },
    { code: "M41.20", desc: "Other idiopathic scoliosis, site unspecified" },
    { code: "M40.10", desc: "Other secondary kyphosis, site unspecified" },
    { code: "M96.5", desc: "Postlaminectomy kyphosis" },
    { code: "M43.00", desc: "Spondylolysis, site unspecified" },
  ],
  "Tumor / Infection": [
    { code: "C79.51", desc: "Secondary malignant neoplasm of bone" },
    { code: "D16.6", desc: "Benign neoplasm of vertebral column" },
    { code: "M46.20", desc: "Osteomyelitis of vertebra, site unspecified" },
    { code: "G06.1", desc: "Epidural abscess, intraspinal" },
    { code: "M46.46", desc: "Discitis, lumbar region" },
  ],
};

export default ICD10_CODES;
