import Pattern from '../models/pattern_model.js';


export const newPattern = (req, res) => {
  if (!hasProps(req.body, ['name'])) {
    res.json({
      error: 'Patterns need a \'name\' field.',
    });
  } else {
    const pattern = new Pattern();

    pattern.name = req.body.name;

    pattern.save()
    .then(result => {
      console.log(`POST:\tAdded pattern ${pattern.name}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};
