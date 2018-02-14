var express = require( "express" );
var app = express();

var bodyParser = require( "body-parser" );
var path = require( "path" );
var mongoose = require( 'mongoose' );

mongoose.Promise = global.Promise;
 
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( express.static( path.join( __dirname, "./static") ) );

app.set( 'views', path.join( __dirname, './views' ) );
app.set( 'view engine', 'ejs' );

mongoose.connect( "mongodb://localhost/message_board" );

var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema( {
    name: {type: String, required: true, minlength: 4},
    message: {type: String, reqired: true},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
}, {timestamps: true} );
var Message = mongoose.model( "Message", MessageSchema );

var CommentSchema = new mongoose.Schema({
    _message: {type: Schema.Types.ObjectId, ref: "Message"},
    name: {type: String, required: true},
    comment: {type: String, required: true},
}, {timestamps: true});
var Comment = mongoose.model( "Comment", CommentSchema );

app.get( "/", function( req, res ){
    // Message.find( {}, function( err, message ){})
    Message.find( {}, function( err, messages ){
        if( err ){
            console.log( err );
            res.send( err );
        } else {
            Comment.find( {}, function( err, comments ){
                if( err ){
                    console.log( err );
                    res.send( err );
                } else {
                    res.render( "index", {messages: messages, comments: comments} );
                }
            })
        }
    })
});

app.post( "/messages/create", function( req, res ){
    console.log( "MESSAGE:", req.body );
    var message = new Message({
        name: req.body.name,
        message: req.body.message
    });
    message.save( function( err ){
        if( err ){
            console.log( "error saving the message into the database" );
            res.send( err );
        } else {
            console.log( "successfully added the message into the database" );
            Message.find({}, function( err, messages ){
                console.log( messages );
            })
            res.redirect( "/" );
        }
    })
})

app.post( "/comments/create/message/:id", function( req, res ){
    Message.findOne( {_id: req.params.id}, function( err, message ){
        let comment = new Comment( req.body );
        comment._message = message._id;
        message.comments.push( comment );
        comment.save( function( err ){
            message.save( function( err ){
                if( err ){
                    console.log( err );
                    res.send( err );
                } else {
                    console.log( "COMMENT:", req.body );
                    res.redirect( "/" );
                }
            })
        } )
    })
})

app.listen( 8000, function() {
    console.log( "listening on port 8000" );
});