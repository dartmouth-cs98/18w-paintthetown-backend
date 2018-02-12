import tag from '../models/tag_model.js';

import { hasProps } from '../utils';

export const newTag = (req, res) => {
  if (!hasProps(req.body, ['title'])) {
    res.json({
      error: 'tag needs a \'title\' field.',
    });
  } else {
    const tag = new Tag();

    tag.name=req.body.title;

    if (hasProp(req.body, 'description')){
      tag.description=req.body.description;
    }

    tag.save()
    .then(result => {
      console.log(`POST:\tAdded tag ${tag.title}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};
