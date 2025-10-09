import PeopleRequisition from '../models/peopleRequisitionModel.mjs';

const createNewPeopleRequisition = async (prData) => {
    return PeopleRequisition.create(prData);
};
const findActiveByDetails = async (jobId, departmentId, natureOfEmploymentId) => {
    return PeopleRequisition.findOne({
        JobId: jobId,
        DepartmentId: departmentId,
        NatureOfEmploymentId: natureOfEmploymentId,
        IsDelete: false,
        Status: { $in: ['open', 'inprogress']},
    });
};

const findByIdAndPopulateDetails = async (id) => {
    return PeopleRequisition.findById(id)
        .populate({
            path: 'RecruiterId',
            select: 'Name Email'
        })
        .populate({
            path: 'DepartmentId',
            select: 'Department'
        })
        .populate({
            path: 'JobId',
            select: 'JobPosition'
        })
        .populate({
            path: 'HRBPId',
            select: 'Name Email'
        });
};

const findById = async (id) => {
    return PeopleRequisition.findById(id);
};

const findAllPeopleRequisition = async (filters, sortOptions, page, limit) => {
    const skip = (page - 1) * limit;
    const query = PeopleRequisition.find(filters)
        .populate('JobId', 'JobPosition')
        .populate('DepartmentId', 'Department')
        .populate('RecruiterId', 'Name')
        .populate('HRBPId', 'Name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    const countQuery = PeopleRequisition.countDocuments(filters);
    const [results, total] = await Promise.all([
        query.exec(),
        countQuery.exec(),
    ]);
    return { results, total };
};

export const peopleRequisitionQueries = {
    createNewPeopleRequisition,
    findActiveByDetails,
    findByIdAndPopulateDetails, 
    findById,
    findAllPeopleRequisition,
};