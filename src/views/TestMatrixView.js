import React, { Component } from 'react';
import * as d3 from 'd3';


class TestMatrixView extends Component {
    constructor(props) {
        super(props);
        this.state = 
        {
            prod_methods: this.props.prod_methods,
            test_methods: this.props.test_methods,
            width: this.props.size[0],
            height: this.props.size[1],
        }

        this.ref = React.createRef();

        this.createMatrix = this.createMatrix.bind(this);
        this.createTestMatrixView = this.createTestMatrixView.bind(this);
    }

    createMatrix() {
        if (this.state.prod_methods.length === 0 || this.state.test_methods.length === 0) {
            return []
        }

        let prod_methods = this.state.prod_methods
        let test_methods = this.state.test_methods

        // Determine number of tests
        let number_of_tests = test_methods.length

        let matrix = [...Array(prod_methods.length)].map(e => Array(number_of_tests + 1).fill(0));

        console.log("productions", prod_methods);
        console.log("number of methods: ", prod_methods.length)
        console.log("number of tests: ", number_of_tests)

        prod_methods.forEach((method, method_index) => {
            if (method_index < 10) {
                console.log(method);
            }
            method.test_ids.forEach((test_id) => {
                matrix[method_index][test_id] = 1
            })
        })

        return matrix;
    }

    componentDidMount() {
        this.createTestMatrixView();
    }

    // componentDidUpdate() {
    //     this.createTestMatrixView();
    // }

    componentWillReceiveProps(props) {
        console.log("componentWillReceiveProps", props.prod_methods)
        this.setState({
            prod_methods: props.prod_methods,
            test_methods: props.test_methods,
            width: props.size[0],
            height: props.size[1],
        }, this.createTestMatrixView);
    }

    createTestMatrixView() {
        const node = this.ref.current;
        let data = this.createMatrix();

        let numColumns;
        let numRows;

        if (data.length === 0) {            
            numRows = 0;
            numColumns = 0;
        } else {
            numRows = data.length
            numColumns = data[0].length
        }

        console.log([numRows, numColumns])
        let xScale = d3.scaleBand()
            .domain(d3.range(numColumns))
            .range([0, this.state.width]);

        let yScale = d3.scaleBand()
            .domain(d3.range(numRows))
            .range([0, this.state.height]);

        let svg = d3.select(node);
        // TODO for some reason data is not updated properly.
        d3.select(node).selectAll('.row').remove()
        
        let rows = svg.selectAll('.row')
            .data(data);
        
        let currentRows = rows.enter()
                .append('g')
                .attr("class", "row")
                .attr("transform", function (d, i) { return "translate(0, " + yScale(i) + ")";});
        
        rows.exit().transition().style("opacity", 0).delay(100).remove();
        
        let cells = currentRows.selectAll(".cell")
            .data(function (d) {return d;});

        cells.enter()
                .select(function (d, i) { return d === 1 ? this: null})
                .append("rect")
                .attr("class", "cell")
                .attr("x", function (d, i) { return xScale(i) })
                .attr("fill", function(d, i) {
                    return d === 1 ? "black" : "white"
                })
                .attr("width", Math.max(1, xScale.bandwidth()))
                .attr("height", Math.max(1, yScale.bandwidth()));
    
        
        cells.exit().remove();
    }

    render() {
        return (
            <svg ref={this.ref} width={this.state.width} height={this.state.height}></svg>
        )
    }
}

export default TestMatrixView;