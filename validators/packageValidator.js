import Joi from 'joi';
export const PackageValidator = Joi.object ({
costumer: objectId.required().label('customer ID'),

package: objectId.required().label('Package ID'),

startDate: Joi.date().default(() => new Date())
.label('Start Date'),

endDate: Joi.date().greater(Joi.ref('Start Date')).required()
.label('End Date'),

status: Joi.string().valid('active','expired', 'pending','suspended')
.default('pending').label('subscription status'),

autoRenewal:Joi.boolean().default(false).label('Subcription Renewal'),

renewalHistory: Joi.array()
    .items(
      Joi.object({
        renewalDate: Joi.date().required().label('Renewal Date'),
        previousEndDate: Joi.date().required().label('Previous End Date'),
        newEndDate: Joi.date().required().label('New End Date'),
        renewedBy: objectId.required().label('Renewed By (Branch Admin ID)'),
      })
    )
    .default([])
    .label('Renewal History'),
});




// // ObjectId pattern (24 hex chars)
// const objectId = Joi.string().hex().length(24).message('Invalid ObjectId format');























