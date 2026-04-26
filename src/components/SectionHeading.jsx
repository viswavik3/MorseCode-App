export default function SectionHeading({ eyebrow, title, description, aside }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="eyebrow">{eyebrow}</p>
        ) : null}
        <h2 className="page-title mt-3">{title}</h2>
        {description ? <p className="page-copy mt-3">{description}</p> : null}
      </div>
      {aside ? <div>{aside}</div> : null}
    </div>
  );
}
