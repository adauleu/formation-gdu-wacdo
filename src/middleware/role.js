"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.hasOneOfRole = void 0;
function hasOneOfRole(roles) {
    return function (req, res, next) {
        const { role: userRole } = req.user;
        if (!roles.includes(userRole))
            res.status(403).json({ message: 'You dont have the right to access this resource' });
        else
            next();
    };
}
exports.hasOneOfRole = hasOneOfRole;
function hasRole(role) {
    return function (req, res, next) {
        const { role: userRole } = req.user;
        if (userRole !== 'admin' && role !== userRole)
            res.status(403).json({ message: 'You dont have the right to access this resource' });
        else
            next();
    };
}
exports.hasRole = hasRole;
